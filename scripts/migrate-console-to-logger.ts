#!/usr/bin/env tsx
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';

const APPLY = process.argv.includes('--apply');
const SKIP_GLOBS = [
  '!**/__tests__/**',
  '!**/node_modules/**',
  '!packages/**/dist/**',
  '!packages/**/build/**',
  '!packages/**/lib/**',
  '!packages/shared-types/**',
  '!packages/health-schema/**',
  '!packages/analytics/**'
];

async function processFile(file: string) {
  const src = await fs.readFile(file, 'utf8');
  if (!/\bconsole\./.test(src)) return null;
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const moduleName = path.basename(file).replace(/\.[tj]sx?$/, '');

  let changed = false;
  let newSrc = src;

  newSrc = newSrc.replace(/\bconsole\.(log|info|warn|error|debug)\b/g, (_m, g1) => {
    changed = true;
    const map: Record<string, string> = { log: 'info', info: 'info', warn: 'warn', error: 'error', debug: 'debug' };
    return `log.${map[g1]}`;
  });

  if (!changed) return null;

  if (!/from ['\"]@athlete-ally\/logger['\"]/m.test(newSrc)) {
    newSrc = `import { createLogger } from '@athlete-ally/logger';\nimport nodeAdapter from '@athlete-ally/logger/server';\n` + newSrc;
  }
  if (!/const\s+log\s*=\s*createLogger\(/m.test(newSrc)) {
    newSrc = newSrc.replace(/^(?:import[^\n]*\n)+/, (imports) => {
      return imports + `const log = createLogger(nodeAdapter, { module: '${moduleName}' });\n`;
    });
  }

  if (APPLY) {
    await fs.writeFile(file, newSrc, 'utf8');
  }
  return { file: rel, changed, applied: APPLY };
}

async function main() {
  const files = await globby(['packages/*/src/**/*.{ts,tsx,js,jsx}', ...SKIP_GLOBS]);
  const results: any[] = [];
  for (const f of files) {
    const r = await processFile(f);
    if (r) results.push(r);
  }
  console.log(JSON.stringify({ kind: 'codemod-console-to-logger', apply: APPLY, results }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(2); });

