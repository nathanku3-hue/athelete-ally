#!/usr/bin/env node
/**
 * Alpha Smoke: Post-deploy verification
 * - Verifies core BFF endpoints and async plan flow
 * - Requires BFF base URL; Authorization token optional (generated if JWT_SECRET provided)
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.SMOKE_BASE_URL || process.env.E2E_API_BASE_URL || 'http://localhost:4101';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS || '90000', 10);
const POLL_INTERVAL_MS = parseInt(process.env.SMOKE_POLL_INTERVAL_MS || '1500', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-jwt-secret';
const USER_ID = process.env.SMOKE_USER_ID || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}`);

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signHS256(secret, data) {
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateJwt(userId, role = 'user') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // 1h
  const payload = { userId, role, iat, exp, iss: 'athlete-ally', aud: 'athlete-ally-users' };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const sig = signHS256(JWT_SECRET, `${h}.${p}`);
  return `${h}.${p}.${sig}`;
}

function fetchJson(url, opts = {}) {
  const isHttps = url.startsWith('https://');
  const mod = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.request(url, { method: opts.method || 'GET', headers: opts.headers || {} }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function main() {
  const token = process.env.SMOKE_TOKEN || generateJwt(USER_ID);
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('Smoke | Base URL:', BASE_URL);
  console.log('Smoke | User ID :', USER_ID);

  // 1) Health
  const health = await fetchJson(`${BASE_URL}/health`);
  if (health.status !== 200) throw new Error(`Service health failed: ${health.status}`);
  console.log('OK   | Service health');

  // 2) Onboarding submit
  const onboardingPayload = {
    userId: USER_ID,
    purpose: 'general_fitness',
    proficiency: 'beginner',
    season: 'offseason',
    availabilityDays: 3,
    weeklyGoalDays: 3,
    equipment: ['bodyweight'],
    fixedSchedules: [],
    recoveryHabits: [],
    onboardingStep: 6,
    isOnboardingComplete: true,
  };
  const onboarding = await fetchJson(`${BASE_URL}/api/v1/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: onboardingPayload,
  });
  if (![200, 202].includes(onboarding.status)) throw new Error(`Onboarding failed: ${onboarding.status}`);
  console.log('OK   | Onboarding submit');

  // 3) Plan generate
  const gen = await fetchJson(`${BASE_URL}/api/v1/plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: { userId: USER_ID },
  });
  if (gen.status !== 202 || !gen.data?.jobId) throw new Error(`Plan generate failed: ${gen.status}`);
  const jobId = gen.data.jobId;
  console.log('OK   | Plan generate (jobId:', jobId + ')');

  // 4) Poll status
  const start = Date.now();
  let lastStatus = null;
  while (Date.now() - start < TIMEOUT_MS) {
    const st = await fetchJson(`${BASE_URL}/api/v1/plans/status?jobId=${encodeURIComponent(jobId)}`, {
      headers: { ...authHeaders },
    });
    if (st.status === 200) {
      lastStatus = st.data;
      const s = (st.data && st.data.status) || 'unknown';
      console.log('Info | Plan status:', s);
      if (['queued', 'processing', 'completed', 'failed', 'not_found'].includes(s) || st.data?.jobId) break;
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  if (!lastStatus) throw new Error('Status polling did not return a valid response');
  console.log('OK   | Status polling (observed state)');

  // 5) Exercises list
  const exList = await fetchJson(`${BASE_URL}/api/v1/exercises?limit=5`);
  if (exList.status !== 200) throw new Error(`Exercises list failed: ${exList.status}`);
  console.log('OK   | Exercises list');

  // 6) Workout summary (JWT user)
  const summary = await fetchJson(`${BASE_URL}/api/v1/workouts/summary?timeRange=7d`, { headers: { ...authHeaders } });
  if (summary.status !== 200) throw new Error(`Workout summary failed: ${summary.status}`);
  console.log('OK   | Workout summary');

  console.log('SUCCESS: Alpha smoke checks passed');
}

main().catch((err) => {
  console.error('FAIL:', err.message || err);
  process.exit(1);
});

