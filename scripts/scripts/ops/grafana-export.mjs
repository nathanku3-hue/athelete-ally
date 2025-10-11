#!/usr/bin/env node
// scripts/ops/grafana-export.mjs
// Export Grafana dashboards by UID to JSON files. Strips ephemeral fields by default.

import fs from 'fs';
import path from 'path';

function parseArgs(argv) {
  const args = { uids: [], uidsFile: '', toDashboards: false, outRoot: '', basePath: '', rejectUnauthorized: true, help: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--help' || k === '-h') { args.help = true; }
    else if (k === '--uids' && v) { args.uids = v.split(',').map(s => s.trim()).filter(Boolean); i++; }
    else if (k === '--uids-file' && v) { args.uidsFile = v; i++; }
    else if (k === '--to-dashboards') { args.toDashboards = true; }
    else if (k === '--out' && v) { args.outRoot = v; i++; }
    else if (k === '--basePath' && v) { args.basePath = v; i++; }
    else if (k === '--rejectUnauthorized' && v) { args.rejectUnauthorized = !/^false$/i.test(v); i++; }
  }
  return args;
}

function usage(){
  console.log(`\nUsage: node scripts/ops/grafana-export.mjs [options]\n\nOptions:\n  --uids <csv>                 Comma-separated dashboard UIDs\n  --uids-file <file>           File with one UID per line\n  --to-dashboards              Write to monitoring/grafana/dashboards/\n  --out <dir>                  Output directory (default: reports/grafana-export/YYYYMMDD)\n  --basePath <path>            Optional Grafana base path (e.g., /grafana)\n  --rejectUnauthorized <bool>  Reject self-signed TLS (default: true)\n  -h, --help                   Show this help\n`);
}

function stripEphemeral(d) {
  const omit = new Set(['id','version','folderId','meta','updated','updatedAt','iteration','timepicker']);
  const clone = JSON.parse(JSON.stringify(d));
  for (const k of Object.keys(clone)) { if (omit.has(k)) delete clone[k]; }
  return clone;
}

function kebab(s) { return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) { usage(); process.exit(0); }

  const GRAFANA_URL = process.env.GRAFANA_URL || '';
  const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN || '';
  const BASE_PATH = args.basePath || process.env.GRAFANA_BASE_PATH || '';
  if (!args.rejectUnauthorized) { process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; }

  if (!GRAFANA_URL || !GRAFANA_TOKEN) {
    console.error('Missing GRAFANA_URL or GRAFANA_TOKEN');
    process.exit(1);
  }
  if (args.uidsFile) {
    const text = fs.readFileSync(args.uidsFile,'utf8');
    args.uids.push(...text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean));
  }
  args.uids = Array.from(new Set(args.uids));
  if (args.uids.length === 0) {
    console.error('No UIDs provided');
    process.exit(1);
  }
  const api = (p) => {
    const url = new URL(GRAFANA_URL);
    const base = BASE_PATH ? `${url.origin}${BASE_PATH}` : url.origin;
    return `${base}${p}`;
  };
  const headers = { 'Authorization': `Bearer ${GRAFANA_TOKEN}`, 'Content-Type': 'application/json' };

  const dt = new Date();
  const ymd = dt.toISOString().slice(0,10).replace(/-/g,'');
  const outRoot = args.outRoot || path.resolve(process.cwd(), 'reports', 'grafana-export', ymd);
  fs.mkdirSync(outRoot, { recursive: true });

  for (const uid of args.uids) {
    const r = await fetch(api(`/api/dashboards/uid/${encodeURIComponent(uid)}`), { headers });
    if (!r.ok) {
      console.error(`Failed to fetch UID ${uid}: ${r.status}`);
      continue;
    }
    const j = await r.json();
    const dash = j?.dashboard || {};
    const clean = stripEphemeral(dash);
    const title = clean.title || uid;
    const fname = `${uid}-${kebab(title)}.json`;
    const targetDir = args.toDashboards ? path.resolve(process.cwd(), 'monitoring', 'grafana', 'dashboards') : outRoot;
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, fname), JSON.stringify(clean, null, 2));
    console.log(`Exported ${uid} -> ${path.relative(process.cwd(), path.join(targetDir, fname))}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
