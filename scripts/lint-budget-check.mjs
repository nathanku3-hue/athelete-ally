#!/usr/bin/env node
// Delta check: block new ESLint violations in changed files vs. lint-budget.json baseline.
// - Uses unified config
// - Low-tier rules can warn-only when LINT_LOW_TIER_WARN_ONLY=true
// - Optional allowlist via lint-allowlist.json: [{"glob":"path/sub","rule":"rule-id","expires":"2025-12-31"}]
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const CONFIG_FILE = 'eslint.config.unified.mjs';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 100 });
  if (res.error) throw res.error;
  return { stdout: res.stdout || '', stderr: res.stderr || '', status: res.status ?? 0 };
}

function readJSON(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function today() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return today() > dateStr;
}

function determineBaseRef() {
  if (process.env.GITHUB_BASE_REF) return process.env.GITHUB_BASE_REF;
  return 'main';
}

function getChangedFiles() {
  const base = determineBaseRef();
  let range;
  try {
    const mergeBase = (run('git', ['merge-base', 'origin/' + base, 'HEAD']).stdout || '').trim();
    range = mergeBase + '..HEAD';
  } catch {
    range = 'HEAD~1..HEAD';
  }
  let files = [];
  try {
    const out = run('git', ['diff', '--name-only', '--diff-filter=ACM', range]).stdout || '';
    files = out.split('\n').map(s => s.trim()).filter(Boolean);
  } catch {}
  files = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f));
  return files;
}

function runESLintJSON(files) {
  if (!files.length) return [];
  const args = ['eslint', '--config', CONFIG_FILE, ...files, '-f', 'json'];
  const { stdout } = run('npx', args);
  return JSON.parse(stdout || '[]');
}

function readAllowlist() {
  const p = path.join(process.cwd(), 'lint-allowlist.json');
  const entries = readJSON(p, []);
  return Array.isArray(entries) ? entries : [];
}

function allowedBy(entryList, filePath, ruleId) {
  for (const e of entryList) {
    if (!e || !e.glob || !e.rule) continue;
    if (e.rule !== ruleId) continue;
    // simple contains match for path; callers should use specific segments
    if (filePath.indexOf(e.glob) !== -1) {
      if (isExpired(e.expires)) {
        // expired; do not allow
        continue;
      }
      return true;
    }
  }
  return false;
}

const budgetPath = path.join(process.cwd(), '.github', 'ci', 'lint-budget.json');
const baseline = readJSON(budgetPath, { budgetByRule: {}, tierByRule: {} });
const budget = baseline.budgetByRule || {};
const tierByRule = baseline.tierByRule || {};
const warnLowTier = String(process.env.LINT_LOW_TIER_WARN_ONLY || 'true').toLowerCase() === 'true';
const allowlist = readAllowlist();

const changed = getChangedFiles();
if (!changed.length) {
  console.log('No changed source files; passing.');
  process.exit(0);
}

const results = runESLintJSON(changed);

// Aggregate after allowlist filtering
const changedCounts = {};
const expiredNotes = [];
for (const file of results) {
  const fp = file.filePath || '';
  for (const msg of (file.messages || [])) {
    const id = msg.ruleId || 'eslint-parse-error';
    // check allowlist
    const allow = allowlist.some(e => {
      if (!e || !e.glob || !e.rule) return false;
      const match = fp.indexOf(e.glob) !== -1 && e.rule === id;
      if (match && e.expires && isExpired(e.expires)) {
        expiredNotes.push('- expired allowlist: ' + e.glob + ' for ' + id + ' (expired ' + e.expires + ')');
        return false;
      }
      return match;
    });
    if (allow) continue;
    changedCounts[id] = (changedCounts[id] || 0) + 1;
  }
}

const deltas = {};
let blocking = false;
for (const rule in changedCounts) {
  const count = changedCounts[rule];
  const base = budget[rule] || 0;
  const newTotal = base + count;
  const over = newTotal > base;
  const tier = tierByRule[rule] || 'medium';
  let status = 'OK';
  if (over) {
    if (tier === 'low' && warnLowTier) {
      status = 'WARN';
    } else {
      status = 'BLOCK';
      blocking = true;
    }
  }
  deltas[rule] = { base, delta: count, newTotal, tier, status };
}

const rulesTouched = Object.keys(changedCounts).length;
const header = [];
header.push('ESLint Budget Delta (changed files only)');
header.push('- Files: ' + changed.length);
header.push('- Rules touched: ' + rulesTouched);
header.push('- Result: ' + (blocking ? 'FAIL (new violations detected)' : 'PASS (no blocking violations)'));

// Markdown table
const rows = [];
rows.push('| Rule | Tier | Delta | Base | New | Status |');
rows.push('|---|---:|---:|---:|---:|---|');
// sort by severity (BLOCK > WARN > OK) then delta desc
const orderVal = s => (s === 'BLOCK' ? 2 : s === 'WARN' ? 1 : 0);
Object.entries(deltas)
  .sort((a,b)=> (orderVal(b[1].status) - orderVal(a[1].status)) || (b[1].delta - a[1].delta))
  .slice(0, 15)
  .forEach(([rule, info]) => {
    rows.push('|' + rule + '|' + info.tier + '|' + info.delta + '|' + info.base + '|' + info.newTotal + '|' + info.status + '|');
  });

const summary = header.concat(rows).concat(expiredNotes.length ? ['','Notes:', ...Array.from(new Set(expiredNotes))] : []).join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n'); } catch {}
}

try {
  fs.mkdirSync(path.join(process.cwd(), 'reports', 'lint'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'reports', 'lint', 'lint-delta.json'), JSON.stringify({ changed, deltas }, null, 2));
} catch {}

process.exit(blocking ? 1 : 0);
