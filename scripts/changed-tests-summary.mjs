#!/usr/bin/env node
import * as fsSync from 'node:fs';
import { getChangedFiles } from './boundaries-lib.mjs';

function writeSummary(lines) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  const text = lines.join('\n') + '\n';
  if (summary) { fsSync.appendFileSync(summary, text); }
  else { console.log(text); }
}

function main() {
  const changed = getChangedFiles();
  const scope = changed.filter((p)=> p.startsWith('packages/feature-hello/') || p.startsWith('templates/feature-module/'));
  const tests = new Set();
  for (const p of scope) {
    if (p.endsWith('.test.ts') || p.endsWith('.test.tsx')) tests.add(p);
    if (p.startsWith('packages/feature-hello/')) tests.add('packages/feature-hello/tests/contract.test.ts');
  }

  const lines = [];
  lines.push('Changed Tests Summary (Stream 4 scope)');
  lines.push('- Changed files in scope: '+(scope.length||0));
  if (scope.length) lines.push('  '+scope.join('\n  '));
  lines.push('- Suggested tests to run:');
  if (tests.size) { for (const t of tests) lines.push('  '+t); }
  else lines.push('  (none)');
  writeSummary(lines);
}

main();

