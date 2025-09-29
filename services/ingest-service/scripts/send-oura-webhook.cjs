/* Simulate Oura webhook POST with valid HMAC-SHA256 signature */
const crypto = require('node:crypto');

function computeSignature(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
}

(async () => {
  const base = process.env.INGEST_BASE_URL || 'http://localhost:4101';
  const userId = process.env.E2E_USER || 'e2e-user-oura';
  const date = process.env.E2E_DATE || '2024-01-15';
  const secret = process.env.OURA_WEBHOOK_SECRET;
  if (!secret) { console.log('No OURA_WEBHOOK_SECRET set; skipping webhook simulation'); process.exit(0); }

  const payload = JSON.stringify({ vendor: 'oura', userId, date, rMSSD: 42.5, capturedAt: new Date().toISOString() });
  const sig = computeSignature(secret, payload);
  const res = await fetch(`${base}/webhooks/oura`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-oura-signature': `sha256=${sig}` },
    body: payload,
  });
  console.log('Webhook response', res.status);
  if (!res.ok) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });

