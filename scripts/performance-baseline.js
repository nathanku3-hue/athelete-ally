/*
  scripts/performance-baseline.js
  Measures end-to-end latency for onboarding -> plan generation request via Gateway BFF.
  - Requires Gateway at GATEWAY_URL (default http://localhost:4000)
  - Posts to /api/v1/onboarding with minimal payload, then polls /api/v1/plans/status?jobId=...
  - Records overall latency per run; outputs JSON summary with p50/p90/p99.
*/
const fetch = require('node-fetch');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';
const RUNS = Number(process.env.RUNS || 10);
const POLL_MS = Number(process.env.POLL_MS || 250);
const MAX_POLLS = Number(process.env.MAX_POLLS || 40); // ~10s

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function oneRun(i){
  const start = Date.now();
  const userId = `perf_user_${Date.now()}_${i}`;
  try {
    const onboarding = await fetch(`${GATEWAY_URL}/api/v1/onboarding`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev-test-token' },
      body: JSON.stringify({ userId, purpose: 'general_fitness', proficiency: 'beginner', availabilityDays: 3 })
    });
    const body = await onboarding.json().catch(()=>({}));
    if (!onboarding.ok || !body.jobId) throw new Error(`onboarding failed: ${onboarding.status}`);
    const jobId = body.jobId;
    let polls = 0; let status = 'queued';
    while (polls++ < MAX_POLLS && status !== 'completed' && status !== 'failed'){
      await sleep(POLL_MS);
      const resp = await fetch(`${GATEWAY_URL}/api/v1/plans/status?jobId=${encodeURIComponent(jobId)}`, {
        headers: { Authorization: 'Bearer dev-test-token' }
      });
      const s = await resp.json().catch(()=>({}));
      status = s.status || status;
    }
    const end = Date.now();
    return { ok: true, ms: end - start, status };
  } catch (e){
    return { ok: false, error: String(e), ms: Date.now() - start };
  }
}

function quantiles(arr){
  const a = [...arr].sort((x,y)=>x-y);
  const q = p=> a.length? a[Math.min(a.length-1, Math.floor(p*(a.length-1)))] : null;
  return { p50: q(0.50), p90: q(0.90), p99: q(0.99) };
}

(async () => {
  const results = [];
  for (let i=0;i<RUNS;i++) results.push(await oneRun(i));
  const oks = results.filter(r=>r.ok).map(r=>r.ms);
  const qs = quantiles(oks);
  const summary = { runs: RUNS, success: oks.length, errors: results.filter(r=>!r.ok).length, quantiles: qs, results };
  console.log(JSON.stringify(summary, null, 2));
})();

