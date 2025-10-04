#!/usr/bin/env node
/**
 * Grafana validation script for A2 (Sleep Observability).
 * - Validates dashboard by UID exists and variables are present
 * - Optionally moves dashboard to Observability folder (if token has folder perms)
 * - Optionally renders one panel to verify variables parse
 *
 * Env:
 *   GRAFANA_URL (required for full validation)
 *   GRAFANA_TOKEN (required for full validation)
 *   VALIDATE_UID (default: aa-sleep-norm)
 *   VAR_JOB (default: normalize)
 *   VAR_STREAM (default: AA_CORE_HOT)
 *   VAR_DURABLE (default: normalize-sleep-durable)
 *   VAR_SUBJECT (default: athlete-ally.sleep.raw-received)
 *   MOVE_TO_OBSERVABILITY (default: false) -> attempt to move dashboard into Observability folder
 *
 * Exit codes:
 *   0 success or skipped (no secrets)
 *   1 validation error
 */

const GRAFANA_URL = process.env.GRAFANA_URL;
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN;
const UID = process.env.VALIDATE_UID || 'aa-sleep-norm';
const MOVE_TO_OBS = (process.env.MOVE_TO_OBSERVABILITY || '').toLowerCase() === 'true';
const VARS = {
  job: process.env.VAR_JOB || 'normalize',
  stream: process.env.VAR_STREAM || 'AA_CORE_HOT',
  durable: process.env.VAR_DURABLE || 'normalize-sleep-durable',
  subject: process.env.VAR_SUBJECT || 'athlete-ally.sleep.raw-received',
};

if (!GRAFANA_URL || !GRAFANA_TOKEN) {
  console.log('[A2] SKIP: GRAFANA_URL/GRAFANA_TOKEN not set; skipping remote validation.');
  process.exit(0);
}

/** Minimal helper using builtin fetch (Node 20+) */
async function api(path, opts = {}) {
  const url = `${GRAFANA_URL.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${GRAFANA_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  return res;
}

function findPanels(dash) {
  const list = [];
  function walk(p) {
    if (!p) return;
    if (Array.isArray(p)) {
      p.forEach(walk);
      return;
    }
    if (p.type && p.id && p.type !== 'row') list.push({ id: p.id, title: p.title || '' });
    if (p.panels) walk(p.panels);
    if (p.targets) {/* no-op */}
  }
  walk(dash.panels);
  return list;
}

function toQuery(vars) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(vars)) params.set(`var-${k}`, v);
  return params.toString();
}

async function ensureObservabilityFolder() {
  try {
    const res = await api('/api/folders');
    if (res.status === 403) {
      console.warn('[A2] WARN: No folders permission; keeping dashboard in its current folder.');
      return null;
    }
    if (!res.ok) {
      console.warn('[A2] WARN: Failed to list folders:', res.status, await res.text());
      return null;
    }
    const folders = await res.json();
    const found = folders.find(f => (f.title || '').toLowerCase() === 'observability');
    if (found) return found;
    const create = await api('/api/folders', { method: 'POST', body: JSON.stringify({ title: 'Observability' }) });
    if (!create.ok) {
      console.warn('[A2] WARN: Failed to create Observability folder:', create.status, await create.text());
      return null;
    }
    return await create.json();
  } catch (e) {
    console.warn('[A2] WARN: ensureObservabilityFolder error:', e.message);
    return null;
  }
}

async function moveDashboardToFolder(dashboard, folderId) {
  const payload = {
    dashboard,
    folderId,
    overwrite: true,
  };
  const res = await api('/api/dashboards/db', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) {
    console.warn('[A2] WARN: move dashboard failed:', res.status, await res.text());
    return false;
  }
  console.log('[A2] Moved dashboard to Observability folder.');
  return true;
}

(async () => {
  console.log(`[A2] Validating Grafana dashboard uid=${UID} ...`);
  const res = await api(`/api/dashboards/uid/${encodeURIComponent(UID)}`);
  if (!res.ok) {
    const body = await res.text();
    console.error('[A2] ERROR: dashboard fetch failed', res.status, body);
    process.exit(1);
  }
  const data = await res.json();
  const dash = data.dashboard;
  const slug = (data.meta && data.meta.slug) || (dash && dash.title ? dash.title.toLowerCase().replace(/\s+/g,'-') : 'dashboard');

  // Validate variables
  const templating = (dash && dash.templating && dash.templating.list) || [];
  const varNames = new Set(templating.map(v => v.name));
  const required = ['job','stream','durable','subject'];
  const missing = required.filter(n => !varNames.has(n));
  if (missing.length) {
    console.error('[A2] ERROR: missing variables:', missing.join(', '));
    process.exit(1);
  }
  console.log('[A2] Variables OK:', required.join(', '));

  // Optionally move to Observability
  if (MOVE_TO_OBS) {
    const folder = await ensureObservabilityFolder();
    if (folder && typeof folder.id === 'number') {
      // Need id, uid, version present for overwrite
      const minimal = {
        ...dash,
        id: dash.id,
        uid: dash.uid,
        version: dash.version,
      };
      await moveDashboardToFolder(minimal, folder.id);
    }
  }

  // Render one panel with variables to sanity-check templating
  const panels = findPanels(dash);
  if (!panels.length) {
    console.warn('[A2] WARN: no renderable panels found; skipping render test');
  } else {
    const panelId = panels[0].id;
    const qs = toQuery(VARS);
    const url = `/render/d-solo/${encodeURIComponent(UID)}/${encodeURIComponent(slug)}?panelId=${panelId}&from=now-6h&to=now&width=1000&height=500&${qs}`;
    const r = await api(url, { headers: { Accept: 'image/png' } });
    if (!r.ok) {
      console.error('[A2] ERROR: render test failed', r.status, await r.text());
      process.exit(1);
    }
    // Some stacks return HTML; accept 200 regardless
    console.log('[A2] Render test OK for panel', panelId);
  }

  console.log('[A2] Grafana validation completed successfully.');
})();
