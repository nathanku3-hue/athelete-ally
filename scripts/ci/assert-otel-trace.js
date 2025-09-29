// Poll Jaeger API for a given traceId and assert spans include expected services.
// Env: JAEGER_BASE_URL (default http://localhost:16686), TRACE_ID, EXPECTED_SERVICES (csv), TIMEOUT_MS
const http = require('node:http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, body });
      });
    }).on('error', reject);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const base = process.env.JAEGER_BASE_URL || 'http://localhost:16686';
  const traceId = process.env.TRACE_ID;
  const expected = (process.env.EXPECTED_SERVICES || 'ingest-service,normalize-service,insights-engine')
    .split(',').map(s => s.trim()).filter(Boolean);
  const timeout = parseInt(process.env.TIMEOUT_MS || '60000', 10);
  const deadline = Date.now() + timeout;
  if (!traceId) {
    console.error('TRACE_ID not set');
    process.exit(2);
  }
  let found = null;
  while (Date.now() < deadline) {
    const url = `${base}/api/traces/${traceId}`;
    const res = await get(url);
    if (res.status === 200) {
      try {
        const json = JSON.parse(res.body);
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          found = json.data[0];
          break;
        }
      } catch {}
    }
    await sleep(1500);
  }
  if (!found) {
    console.error('Trace not found', { traceId });
    process.exit(1);
  }
  const services = new Set(found.spans.map(s => s.process.serviceName));
  const missing = expected.filter(s => !services.has(s));
  if (missing.length) {
    console.error('Missing expected services in trace', { missing, traceId, services: Array.from(services) });
    process.exit(1);
  }
  console.log('Trace OK', { traceId, services: Array.from(services) });
})();

