#!/usr/bin/env node
// Generate lint-budget.json at repo root from a full ESLint scan.
// Includes metadata (generatedAt, versions, quarterlyReduction, budgetByRule)
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 });
  if (res.error) throw res.error;
  return { stdout: res.stdout || '', stderr: res.stderr || '', status: res.status ?? 0 };
}

function readJSONSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function getVersion(modName) {
  try {
    const pkgPath = require.resolve(path.join(modName, 'package.json'), { paths: [process.cwd()] });
    const j = readJSONSafe(pkgPath);
    return j?.version || null;
  } catch { return null; }
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

function runESLintJSON(files = ['.']) {
  const args = ['eslint', ...files, '-f', 'json'];
  const { stdout } = run('npx', args);
  try {
    return JSON.parse(stdout || '[]');
  } catch (e) {
    console.error('Failed to parse ESLint JSON output:', e.message);
    process.exit(2);
  }
}

const results = runESLintJSON(['.']);
const budgets = aggregateRuleCounts(results);

const payload = {
  generatedAt: new Date().toISOString(),
  eslintVersion: getVersion('eslint'),
  pluginVersions: {
    'eslint-plugin-import': getVersion('eslint-plugin-import'),
    'eslint-plugin-boundaries': getVersion('eslint-plugin-boundaries'),
    '@typescript-eslint/eslint-plugin': getVersion('@typescript-eslint/eslint-plugin'),
    '@typescript-eslint/parser': getVersion('@typescript-eslint/parser'),
  },
  quarterlyReduction: '-10%',
  budgetByRule: budgets,
};

const outPath = path.join(process.cwd(), 'lint-budget.json');
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(`Wrote baseline to ${outPath}`);

try {
  fs.mkdirSync(path.join(process.cwd(), 'reports', 'lint'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'reports', 'lint', 'lint-baseline.json'), JSON.stringify(payload, null, 2));
} catch {}
