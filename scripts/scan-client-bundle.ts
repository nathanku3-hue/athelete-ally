#!/usr/bin/env tsx
import { globby } from 'globby';
import fs from 'fs/promises';
const NODE_IMPORTS = ['fs','path','os','child_process','crypto','stream','net','tls','http','https','zlib','util','worker_threads','cluster','dns','dgram','readline','repl','vm'];
async function main() { const files = await globby(['apps/frontend/src/**/*.{ts,tsx,js,jsx}']); const offenders: { file: string; import: string; line: number }[] = []; for (const file of files) { const src = await fs.readFile(file, 'utf8'); const isClient = /^\s*['\"]use client['\"];?/m.test(src); if (!isClient) continue; const lines = src.split(/\r?\n/); lines.forEach((line, idx) => { const m = line.match(/import\s+.*?from\s+['\"]([^'\"]+)['\"]/); if (!m) return; const spec = m[1]; if (NODE_IMPORTS.includes(spec)) offenders.push({ file, import: spec, line: idx + 1 }); }); } if (offenders.length) { console.error(JSON.stringify({ kind: 'client-bundle-scan', offenders }, null, 2)); process.exit(1); } else { console.log(JSON.stringify({ kind: 'client-bundle-scan', offenders: [] })); } }
main().catch((e) => { console.error(e); process.exit(2); });
