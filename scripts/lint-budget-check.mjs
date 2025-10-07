#!/usr/bin/env node
// Compare ESLint violations in changed files against lint-budget.json baseline.
// Fails if any rule would increase beyond baseline (delta-only blocking on changed files).
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 });
  if (res.error) throw res.error;
  return { stdout: res.stdout || '', stderr: res.stderr || '', status: res.status ?? 0 };
}

function readJSON(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function aggregateRuleCounts(eslintJsonArray) {
  const ruleCounts = Object.create(null);
  for (const file of eslintJsonArray) {
    for (const msg of file.messages || []) {
      const id = msg.ruleId || 'eslint-parse-error';
      ruleCounts[id] = (ruleCounts[id] || 0) + 1;
    }
  }
  return ruleCounts;
}

function determineBaseRef() {
  if (process.env.GITHUB_BASE_REF) return process.env.GITHUB_BASE_REF;
  try {
    const upstream = (run('git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']).stdout || '').trim();
    const m = upstream.match(/^(origin|upstream)\/(.+)$/);
    if (m) return m[2];
  } catch {}
  return 'main';
}

function getChangedFiles() {
  const base = determineBaseRef();
  let range;
  try {
    const mergeBase = (run('git', ['merge-base', `origin/${base}`, 'HEAD']).stdout || '').trim();
    range = `${mergeBase}..HEAD`;
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
  const args = ['eslint', ...files, '-f', 'json'];
  const { stdout } = run('npx', args);
  return JSON.parse(stdout || '[]');
}

const budgetPath = path.join(process.cwd(), 'lint-budget.json');
const baseline = readJSON(budgetPath, { budgetByRule: {} });
const budget = baseline.budgetByRule || {};

const changed = getChangedFiles();
if (!changed.length) {
  console.log('No changed source files; passing.');
  process.exit(0);
}

const results = runESLintJSON(changed);
const changedCounts = aggregateRuleCounts(results);

const deltas = {};
let blocking = false;
for (const [rule, count] of Object.entries(changedCounts)) {
  const base = budget[rule] || 0;
  const newTotal = base + count;
  const over = newTotal > base;
  deltas[rule] = { base, delta: count, newTotal, over };
  if (over) blocking = true;
}

const summaryLines = [];
summaryLines.push('ESLint Budget Delta (changed files only)');
summaryLines.push(`- Files: ${changed.length}`);
summaryLines.push(`- Rules touched: ${Object.keys(changedCounts).length}`);
summaryLines.push(`- Result: ${blocking ? 'FAIL (new violations detected)' : 'PASS (no new violations)'}`);

const top = Object.entries(deltas)
  .sort((a, b) => b[1].delta - a[1].delta)
  .slice(0, 10);
for (const [rule, info] of top) {
  summaryLines.push(`  - ${rule}: +${info.delta} (base ${info.base} -> ${info.newTotal})`);
}

console.log(summaryLines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryLines.join('\n') + '\n'); } catch {}
}

try {
  fs.mkdirSync(path.join(process.cwd(), 'reports', 'lint'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'reports', 'lint', 'lint-delta.json'), JSON.stringify({ changed, deltas }, null, 2));
} catch {}

process.exit(blocking ? 1 : 0);
