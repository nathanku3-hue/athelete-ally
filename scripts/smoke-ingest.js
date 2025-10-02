#!/usr/bin/env node

/**
 * Ingest Service Smoke Test
 * Verifies ingest service health and basic functionality
 */

const http = require('http');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:4101';
const TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS || '30000', 10);

function fetchJson(url, opts = {}) {
  const mod = url.startsWith('https') ? https : http;
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
  console.log('Smoke | Base URL:', BASE_URL);
  console.log('Smoke | Testing Ingest Service...');

  try {
    // 1) Health check
    const health = await fetchJson(`${BASE_URL}/health`);
    if (health.status !== 200) {
      throw new Error(`Health check failed: ${health.status}`);
    }
    console.log('OK   | Health check passed');
    console.log('INFO | Service status:', health.data.status);
    console.log('INFO | EventBus:', health.data.eventBus);

    // 2) Verify EventBus connection
    if (health.data.eventBus !== 'connected') {
      throw new Error(`EventBus not connected: ${health.data.eventBus}`);
    }
    console.log('OK   | EventBus connection verified');

    // 3) Test metrics endpoint
    const metrics = await fetchJson(`${BASE_URL}/metrics`);
    if (metrics.status !== 200) {
      throw new Error(`Metrics endpoint failed: ${metrics.status}`);
    }
    console.log('OK   | Metrics endpoint accessible');

    console.log('\n✅ Ingest service smoke test PASSED');
    console.log('INFO | Service is healthy and ready for data ingestion');
    
    return { success: true, message: 'Ingest service smoke test passed' };

  } catch (error) {
    console.error('\n❌ Ingest service smoke test FAILED');
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
