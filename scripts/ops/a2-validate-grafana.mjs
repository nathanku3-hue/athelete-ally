#!/usr/bin/env node
// A2 Grafana validator: non-blocking, uses env GRAFANA_URL/GRAFANA_TOKEN if present.
// Writes JSON summary and optional PNG renders to reports/grafana.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT_DIR = 'reports/grafana';
const DASH_UID = process.env.DASH_UID || 'aa-sleep-norm';
const FROM = process.env.FROM || 'now-6h';
const TO = process.env.TO || 'now';
const VARS = {
  job: process.env.A2_JOB || 'normalize',
  stream: process.env.A2_STREAM || 'AA_CORE_HOT',
  durable: process.env.A2_DURABLE || 'normalize-sleep-durable',
  subject: process.env.A2_SUBJECT || 'athlete-ally.sleep.raw-received',
};

function hasSecrets() { return !!(process.env.GRAFANA_URL && process.env.GRAFANA_TOKEN); }

function qs(params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.set(k, String(v));
  return u.toString();
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }).catch(() => {}); }

async function saveFile(p, buf) { await ensureDir(path.dirname(p)); await fs.writeFile(p, buf); }

async function render(url, token, uid, filename, params) {
  const query = qs({ from: FROM, to: TO, kiosk: 1, width: 1920, height: 1080, ...params, ...VARS });
  const full = `${url.replace(/\/$/, '')}/render/d/${uid}?${query}`;
  const res = await fetch(full, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  await saveFile(path.join(OUT_DIR, filename), buf);
  return { file: path.join(OUT_DIR, filename), size: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
}

async function main() {
  const summary = {
    dashUid: DASH_UID,
    window: { from: FROM, to: TO },
    vars: VARS,
    ok: false,
    skipped: false,
    renders: [],
    notes: [],
  };

  if (!hasSecrets()) {
    summary.skipped = true;
    summary.notes.push('GRAFANA_URL/TOKEN not set; skipping (as designed)');
    await ensureDir(OUT_DIR);
    await saveFile(path.join(OUT_DIR, 'a2_validator_summary.json'), Buffer.from(JSON.stringify(summary, null, 2)));
    console.log('A2 validator: skipped (no secrets)');
    return;
  }

  const url = process.env.GRAFANA_URL;
  const token = process.env.GRAFANA_TOKEN;

  try {
    // Full dashboard render
    const full = await render(url, token, DASH_UID, 'screenshot-full-dashboard.png', {});
    summary.renders.push({ kind: 'dashboard', ...full });

    // Optionally additional renders can be added here (panel-specific if needed)
    summary.ok = true;
  } catch (e) {
    summary.notes.push(`render failed: ${String(e.message || e)}`);
  } finally {
    await ensureDir(OUT_DIR);
    await saveFile(path.join(OUT_DIR, 'a2_validator_summary.json'), Buffer.from(JSON.stringify(summary, null, 2)));
    console.log('A2 validator: wrote summary to', path.join(OUT_DIR, 'a2_validator_summary.json'));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });