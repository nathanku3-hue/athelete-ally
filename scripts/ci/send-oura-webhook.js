// Sends a simulated Oura webhook with valid HMAC and optional W3C traceparent header.
// Env: OURA_WEBHOOK_SECRET, INGEST_BASE_URL (default http://localhost:4101), E2E_USER, E2E_DATE, TRACE_ID(optional)
const http = require('node:http');
const { randomTraceId, randomSpanId, buildTraceparent } = require('./trace-utils');
const crypto = require('node:crypto');

function hmac(secret, body) {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

function postJson(url, headers, json) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'POST', headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end(json);
  });
}

(async () => {
  const secret = process.env.OURA_WEBHOOK_SECRET || '';
  const base = process.env.INGEST_BASE_URL || 'http://localhost:4101';
  if (!secret) {
    console.error('OURA_WEBHOOK_SECRET not set');
    process.exit(2);
  }
  const userId = process.env.E2E_USER || 'E2E_USER';
  const date = process.env.E2E_DATE || new Date().toISOString().slice(0, 10);
  const payload = {
    userId,
    date,
    rMSSD: 42,
    capturedAt: new Date().toISOString(),
    raw: { source: 'e2e' }
  };
  const body = JSON.stringify(payload);
  const signature = 'sha256=' + hmac(secret, body);

  const traceId = (process.env.TRACE_ID && process.env.TRACE_ID.trim()) || randomTraceId();
  const parentId = randomSpanId();
  const traceparent = buildTraceparent(traceId, parentId, true);

  const headers = {
    'content-type': 'application/json',
    'x-oura-signature': signature,
    'traceparent': traceparent,
  };
  const url = base.replace(/\/$/, '') + '/webhooks/oura';
  const res = await postJson(url, headers, body);
  console.log(JSON.stringify({ url, status: res.status, traceId, traceparent, body: res.body }, null, 2));
  if (res.status !== 200) process.exit(1);
})();

