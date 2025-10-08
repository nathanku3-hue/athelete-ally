#!/usr/bin/env tsx
import { globby } from 'globby';
import fs from 'fs/promises';

async function main() {
  const files = await globby([
    'packages/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!packages/**/dist/**',
    '!packages/**/build/**',
    '!packages/**/lib/**',
    '!packages/**/__tests__/**',
  ]);
  const hits: { file: string; line: number; kind: string }[] = [];
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    const lines = src.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const m = line.match(/\bconsole\.(log|info|warn|error|debug)\b/);
      if (m) hits.push({ file, line: idx + 1, kind: (m as any)[1] });
    });
  }
  console.log(JSON.stringify({ kind: 'console-scan', hits }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(2); });
