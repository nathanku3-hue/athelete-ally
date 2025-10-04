#!/usr/bin/env node
// Simple smoke test for insights-engine readiness API
// Usage: node scripts/smoke-readiness.js --base http://localhost:4103 --user u1 --days 7 --out reports/readiness
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { base: 'http://localhost:4103', user: 'u1', days: 7, out: 'reports/readiness' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--base' && next) { args.base = next; i++; }
    else if (a === '--user' && next) { args.user = next; i++; }
    else if (a === '--days' && next) { args.days = Number(next) || 7; i++; }
    else if (a === '--out' && next) { args.out = next; i++; }
  }
  return args;
}

async function main() {
  const { base, user, days, out } = parseArgs(process.argv);
  const results = { ok: true, checks: [], base, user, days, ts: new Date().toISOString() };

  function pass(name, info) { results.checks.push({ name, ok: true, info }); }
  function fail(name, info) { results.ok = false; results.checks.push({ name, ok: false, info }); }

  try {
    // latest
    const latestUrl = `${base}/api/v1/readiness/${encodeURIComponent(user)}/latest`;
    const res1 = await fetch(latestUrl);
    if (res1.status !== 200) {
      fail('latest.status', `expected 200 got ${res1.status}`);
    } else {
      const body = await res1.json();
      const hasScoreOrIncomplete = (typeof body.score === 'number') || (body.incomplete === true);
      if (!hasScoreOrIncomplete) fail('latest.shape', 'missing score and incomplete');
      else pass('latest.shape', 'ok');
    }
  } catch (e) {
    fail('latest.error', String(e && e.message || e));
  }

  try {
    // range (descending)
    const rangeUrl = `${base}/api/v1/readiness/${encodeURIComponent(user)}?days=${encodeURIComponent(days)}`;
    const res2 = await fetch(rangeUrl);
    if (res2.status !== 200) {
      fail('range.status', `expected 200 got ${res2.status}`);
    } else {
      const arr = await res2.json();
      if (!Array.isArray(arr)) {
        fail('range.shape', 'expected array');
      } else {
        const okOrder = arr.every((v, i) => i === 0 || (arr[i - 1].date >= v.date));
        if (!okOrder) fail('range.order', 'not descending by date');
        else pass('range.order', 'ok');
      }
    }
  } catch (e) {
    fail('range.error', String(e && e.message || e));
  }

  // write report
  try {
    const dir = path.resolve(out);
    fs.mkdirSync(dir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const file = path.join(dir, `${ts}.json`);
    fs.writeFileSync(file, JSON.stringify(results, null, 2));
    // eslint-disable-next-line no-console
    console.log(`readiness smoke written: ${file}`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('failed to write report:', e);
  }

  process.exit(results.ok ? 0 : 1);
}

// Node 18 fallback for global fetch
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
}

main();

