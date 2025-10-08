#!/usr/bin/env tsx
/**
 * Scan packages/** for console.* usage. Produces a JSON report.
 * Non-blocking by default; use ESLint to enforce. Exit 0 always.
 */
import { globby } from 'globby';
import fs from 'fs/promises';

async function main() {
  const files = await globby(['packages/**/*.{ts,tsx,js,jsx}', '!**/node_modules/**']);
  const hits: { file: string; line: number; kind: string }[] = [];
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const m = line.match(/\bconsole\.(log|info|warn|error|debug)\b/);
      if (m) hits.push({ file, line: idx + 1, kind: m[1] });
    });
  }
  console.log(JSON.stringify({ kind: 'console-scan', hits }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(2); });