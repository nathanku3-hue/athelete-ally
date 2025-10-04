#!/usr/bin/env node
// Export dashboards by UID from Grafana to local JSON files.
// Usage: GRAFANA_URL=... GRAFANA_TOKEN=... node scripts/ops/grafana-export.mjs aa-sleep-norm another-uid
import fs from 'node:fs/promises';
import path from 'node:path';

const URL = process.env.GRAFANA_URL;
const TOKEN = process.env.GRAFANA_TOKEN;
const UIDS = process.argv.slice(2);

if(!URL || !TOKEN){
  console.error('GRAFANA_URL and GRAFANA_TOKEN are required');
  process.exit(2);
}
if(UIDS.length === 0){
  console.error('Provide at least one dashboard UID');
  process.exit(2);
}

async function exportUID(uid){
  const endpoint = `${URL.replace(/\/$/, '')}/api/dashboards/uid/${encodeURIComponent(uid)}`;
  const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
  if(!res.ok){ throw new Error(`${uid}: HTTP ${res.status} ${res.statusText}`) }
  const json = await res.json();
  const outDir = 'monitoring/grafana/dashboards/exported';
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${uid}.json`);
  await fs.writeFile(outPath, JSON.stringify(json, null, 2)+'\n', 'utf8');
  console.log('Exported', uid, '->', outPath);
}

const main = async () => {
  for(const uid of UIDS){
    try{ await exportUID(uid) } catch(e){ console.error('Export failed for', uid, e.message || e); }
  }
}

main();