#!/usr/bin/env node
// scripts/ops/check-grafana-index.mjs
// Recomputes dashboards index in memory and reports if it differs. Non-blocking.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const dir = path.resolve(process.cwd(), 'monitoring/grafana/dashboards');
const indexPath = path.join(dir, 'index.json');

function sha256(buf){ return crypto.createHash('sha256').update(buf).digest('hex'); }

function loadDash(file){
  try { const j = JSON.parse(fs.readFileSync(file,'utf8')); return j; } catch { return null; }
}

function buildIndex() {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f=>f.endsWith('.json') && f !== 'index.json').sort() : [];
  const dashboards = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const j = loadDash(full) || {};
    const title = j.title || '';
    const uid = j.uid || '';
    const panelsCount = Array.isArray(j.panels) ? j.panels.length : 0;
    const checksumSha256 = sha256(fs.readFileSync(full));
    dashboards.push({ file: `monitoring/grafana/dashboards/${f}`, title, uid, panelsCount, checksumSha256 });
  }
  const generatedAt = new Date().toISOString();
  return { generatedAt, dashboards };
}

function main(){
  const rebuilt = buildIndex();
  let disk = null;
  try { disk = JSON.parse(fs.readFileSync(indexPath,'utf8')); } catch { }
  const a = JSON.stringify(rebuilt, null, 2);
  const b = disk ? JSON.stringify({ ...disk, generatedAt: rebuilt.generatedAt }, null, 2) : '';
  if (a.trim() === b.trim()) {
    console.log('Dashboards index deterministic: OK (no diff except timestamp).');
    process.exit(0);
  } else {
    console.log('Dashboards index drift detected (report-only).');
    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/dashboards_index.rebuilt.json', a);
    if (b) fs.writeFileSync('reports/dashboards_index.disk.json', b);
    process.exit(0);
  }
}

main();