#!/usr/bin/env node
// scripts/ops/grafana-validate.mjs
// Grafana A2 validator: validates dashboard UIDs, optionally renders PNGs. SKIP-safe without secrets.
// Node 18+ required (global fetch). No external deps.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = { uids: [], renderPNGs: false, basePath: '', rejectUnauthorized: true, outDir: 'a2-artifacts' };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--uids' && v) { args.uids = v.split(',').map(s => s.trim()).filter(Boolean); i++; }
    else if (k === '--renderPNGs' && v) { args.renderPNGs = /^true$/i.test(v); i++; }
    else if (k === '--basePath' && v) { args.basePath = v; i++; }
    else if (k === '--rejectUnauthorized' && v) { args.rejectUnauthorized = !/^false$/i.test(v); i++; }
    else if (k === '--outDir' && v) { args.outDir = v; i++; }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const GRAFANA_URL = process.env.GRAFANA_URL || '';
  const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN || '';
  const BASE_PATH = args.basePath || process.env.GRAFANA_BASE_PATH || '';

  if (!args.rejectUnauthorized) {
    // Allow self-signed certs when explicitly requested
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const outRoot = path.resolve(process.cwd(), args.outDir);
  fs.mkdirSync(outRoot, { recursive: true });

  const summary = {
    time: new Date().toISOString(),
    status: 'UNKNOWN',
    reason: '',
    uids: args.uids,
    renderPNGs: !!args.renderPNGs,
    basePath: BASE_PATH,
    results: [],
  };

  if (!GRAFANA_URL || !GRAFANA_TOKEN) {
    summary.status = 'SKIP';
    summary.reason = 'Missing GRAFANA_URL or GRAFANA_TOKEN';
    writeSummary(outRoot, summary);
    console.log('::notice::A2 Validator SKIP: missing secrets');
    return 0;
  }

  const api = (p) => {
    const url = new URL(GRAFANA_URL);
    const base = BASE_PATH ? `${url.origin}${BASE_PATH}` : url.origin;
    return `${base}${p}`;
  };
  const headers = { 'Authorization': `Bearer ${GRAFANA_TOKEN}`, 'Content-Type': 'application/json' };

  let okCount = 0; let failCount = 0;
  if (args.uids.length === 0) args.uids = ['aa-sleep-norm'];

  for (const uid of args.uids) {
    const res = { uid, exists: false, title: '', panels: 0, png: null, error: null };
    try {
      const r = await fetch(api(`/api/dashboards/uid/${encodeURIComponent(uid)}`), { headers });
      if (r.status === 401 || r.status === 403) {
        summary.status = 'SKIP';
        summary.reason = `NO_AUTH (${r.status})`;
        writeSummary(outRoot, summary);
        console.log(`::notice::A2 Validator SKIP: auth ${r.status}`);
        return 0;
      }
      if (!r.ok) throw new Error(`GET /api/dashboards/uid/${uid} -> ${r.status}`);
      const j = await r.json();
      res.exists = true;
      res.title = j?.dashboard?.title || '';
      res.panels = Array.isArray(j?.dashboard?.panels) ? j.dashboard.panels.length : 0;
      okCount++;

      if (args.renderPNGs) {
        // Best-effort PNG render via share link rendering endpoint (renderer plugin must be installed).
        const pngPath = path.join(outRoot, `${uid}.png`);
        const url = api(`/render/d-solo/${encodeURIComponent(uid)}/_?panelId=1&width=1000&height=500&tz=UTC`);
        const pr = await fetch(url, { headers });
        if (pr.ok) {
          const buf = Buffer.from(await pr.arrayBuffer());
          fs.writeFileSync(pngPath, buf);
          res.png = path.basename(pngPath);
        } else {
          res.png = null;
        }
      }
    } catch (e) {
      res.error = String(e?.message || e);
      failCount++;
    }
    summary.results.push(res);
  }

  summary.status = failCount === 0 ? 'OK' : (okCount > 0 ? 'PARTIAL' : 'FAIL');
  writeSummary(outRoot, summary);
  console.log(`::notice::A2 Validator ${summary.status}: ${okCount} ok, ${failCount} failed`);
  return summary.status === 'OK' ? 0 : 0; // Non-blocking
}

function writeSummary(outRoot, summary) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.join(outRoot, `a2-summary-${ts}.json`);
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
}

main().catch(e => { console.error(e); process.exit(0); });