#!/usr/bin/env node
/**
 * Summarize Gitleaks JSON report into GitHub Step Summary (if available).
 * Usage: node scripts/ops/summary-gitleaks.mjs gitleaks.json
 */
import { promises as fs } from 'node:fs';

function safeArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : (Array.isArray(x.findings) ? x.findings : (Array.isArray(x.Leaks) ? x.Leaks : []));
}

function takeTop(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

async function appendSummary(lines) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  await fs.appendFile(file, lines.join('\n') + '\n', 'utf8');
}

async function main() {
  const file = process.argv[2] || 'gitleaks.json';
  let data;
  try {
    data = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    await appendSummary(['\n### Secrets Scan Summary', '- No gitleaks report found or failed to parse.']);
    return;
  }

  const findings = safeArray(data);
  const byRule = new Map();
  const byFile = new Map();
  for (const f of findings) {
    const rule = f.RuleID || f.Rule || f.Description || 'unknown-rule';
    const filePath = f.File || f.Path || f.Target || 'unknown-file';
    byRule.set(rule, (byRule.get(rule) || 0) + 1);
    byFile.set(filePath, (byFile.get(filePath) || 0) + 1);
  }

  const lines = ['\n### Secrets Scan Summary', `- Findings: ${findings.length}`];
  if (findings.length) {
    const topRules = takeTop(byRule, 5);
    lines.push('- Top rules:');
    for (const [r, c] of topRules) lines.push(`  - ${r}: ${c}`);
    const topFiles = takeTop(byFile, 5);
    lines.push('- Top files:');
    for (const [p, c] of topFiles) lines.push(`  - ${p}: ${c}`);
  }
  await appendSummary(lines);
}

main().catch(async e => {
  await appendSummary(['\n### Secrets Scan Summary', `- Error summarizing: ${e?.message || e}`]);
});

