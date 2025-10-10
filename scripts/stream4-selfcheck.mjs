#!/usr/bin/env node
import fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function sha256File(p) {
  try { const buf = fsSync.readFileSync(p); return crypto.createHash('sha256').update(buf).digest('hex'); } catch { return 'missing'; }
}

function hasConsoleUsage(dir) {
  const exts = ['.ts', '.tsx', '.js', '.jsx'];
  const files = walk(dir);
  return files.some((f)=> exts.includes(path.extname(f)) && /\bconsole\./.test(fsSync.readFileSync(f,'utf8')));
}

function walk(dir) {
  const out=[]; for (const ent of fsSync.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir, ent.name); if (ent.isDirectory()) out.push(...walk(p)); else if (ent.isFile()) out.push(p); } return out;
}

function writeSummary(lines) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  const text = lines.join('\n') + '\n';
  if (summary) { fsSync.appendFileSync(summary, text); }
  else { console.log(text); }
}

async function main() {
  const checks = [];
  const tmplDir = 'templates/feature-module';
  const pilotDir = 'packages/feature-hello';

  // Template presence
  const tmplFiles = ['src/index.ts','src/schemas.ts','src/toggle.ts','src/metrics.ts','src/serveronly.ts','tests/contract.test.ts'];
  const missing = tmplFiles.filter((f)=>!fsSync.existsSync(path.join(tmplDir,f)));
  checks.push({ name: 'Template files present', ok: missing.length===0, detail: missing.length?('Missing: '+missing.join(', ')):'ok' });

  // Pilot exports strict
  let exportsStrict=false; let exportDetail='missing';
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(pilotDir, 'package.json'), 'utf8'));
    exportsStrict = pkg && pkg.exports && Object.keys(pkg.exports).length===1 && pkg.exports['.']==='./src/index.ts';
    exportDetail = JSON.stringify(pkg.exports);
  } catch {}
  checks.push({ name: 'Pilot exports map strict', ok: exportsStrict, detail: exportDetail });

  // No direct console in pilot
  let noConsole=true;
  try { noConsole = !hasConsoleUsage(path.join(pilotDir, 'src')); } catch {}
  checks.push({ name: 'No direct console in pilot src', ok: noConsole, detail: noConsole?'ok':'console usage found' });

  // Serveronly guard file present
  const serveronlyExists = fsSync.existsSync(path.join(pilotDir,'src','serveronly.ts')) || fsSync.existsSync(path.join(tmplDir,'src','serveronly.ts'));
  checks.push({ name: 'serveronly guard exists', ok: serveronlyExists, detail: serveronlyExists?'ok':'missing serveronly.ts' });

  // Config fingerprint (eslint + constants)
  const eslintCfg = fsSync.existsSync('eslint.config.unified.mjs') ? 'eslint.config.unified.mjs' : 'eslint.config.mjs';
  const configHash = sha256File(eslintCfg) + ':' + sha256File('scripts/eslint-config-constants.mjs');

  // Render summary
  const lines = [];
  lines.push('Stream 4 Self-Check');
  lines.push('- Config hash: '+configHash);
  for (const c of checks) { lines.push('- ' + (c.ok? 'PASS':'FAIL') + ' ' + c.name + ' (' + c.detail + ')'); }
  writeSummary(lines);

  // Exit non-zero only if core invariants fail (template/pilot essential)
  const must = checks.filter(c=>/Template files|Pilot exports/.test(c.name));
  const ok = must.every(c=>c.ok);
  process.exit(ok?0:1);
}

main().catch((e)=>{ console.error(e); process.exit(1); });

