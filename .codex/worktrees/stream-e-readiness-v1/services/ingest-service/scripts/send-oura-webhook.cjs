#!/usr/bin/env node

/**
 * Send Oura webhook simulation script for E2E testing
 * HMAC-SHA256 webhook simulation with provider-accurate header
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

function createHmacSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

function sendWebhookRequest(url, payload, signature) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Oura-Signature': `sha256=${signature}`,
        'User-Agent': 'Oura/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

async function simulateOuraWebhook() {
  const webhookSecret = process.env.OURA_WEBHOOK_SECRET;
  const ingestServiceUrl = process.env.INGEST_SERVICE_URL || 'http://localhost:3001';

  if (!webhookSecret) {
    console.log('Skipping webhook simulation - missing OURA_WEBHOOK_SECRET');
    return;
  }

  console.log('Simulating Oura webhook...');

  // Sample HRV data payload
  const payload = JSON.stringify({
    user_id: 'e2e-test-user',
    timestamp: new Date().toISOString(),
    data: {
      hrv: {
        rmssd: 45.2,
        sdnn: 52.8,
        pnn50: 12.5,
        lf: 1250.5,
        hf: 890.3,
        lf_hf_ratio: 1.4
      },
      heart_rate: {
        resting: 58,
        average: 72,
        max: 165
      },
      sleep: {
        duration: 7.5,
        efficiency: 0.85,
        deep_sleep: 1.8,
        light_sleep: 4.2,
        rem_sleep: 1.5
      }
    }
  });

  try {
    const signature = createHmacSignature(payload, webhookSecret);
    const webhookUrl = `${ingestServiceUrl}/webhooks/oura`;

    console.log(`Sending webhook to: ${webhookUrl}`);
    const response = await sendWebhookRequest(webhookUrl, payload, signature);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('Webhook simulation successful');
      console.log(`Response: ${response.statusCode} - ${response.body}`);
    } else {
      console.error(`Webhook simulation failed: ${response.statusCode} - ${response.body}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error simulating webhook:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  simulateOuraWebhook().catch(console.error);
}

module.exports = { simulateOuraWebhook };
