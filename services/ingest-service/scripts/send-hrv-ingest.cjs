#!/usr/bin/env node

/**
 * Send HRV ingest script for E2E testing
 * Drives the typed HRV -> normalization path
 */

const https = require('https');
const http = require('http');

function sendHttpRequest(url, payload) {
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
        'Authorization': 'Bearer e2e-test-token'
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

async function sendHrvIngest() {
  const ingestServiceUrl = process.env.INGEST_SERVICE_URL || 'http://localhost:3001';

  console.log('Sending HRV ingest data...');

  // Deterministic HRV data for E2E testing
  const hrvData = {
    userId: 'e2e-test-user',
    date: '2024-01-15',  // API expects 'date' in YYYY-MM-DD format
    rmssd: 45.2,         // API expects 'rmssd' at top level
    capturedAt: '2024-01-15T08:00:00Z',
    raw: {
      provider: 'oura',
      dataType: 'hrv',
      metrics: {
        sdnn: 52.8,
        pnn50: 12.5,
        lf: 1250.5,
        hf: 890.3,
        lfHfRatio: 1.4,
        restingHr: 58,
        averageHr: 72,
        maxHr: 165
      },
      metadata: {
        deviceId: 'oura-ring-e2e-test',
        firmwareVersion: '2.8.0',
        batteryLevel: 85,
        dataQuality: 'good'
      }
    }
  };

  try {
    const payload = JSON.stringify(hrvData);
    const ingestUrl = `${ingestServiceUrl}/api/v1/ingest/hrv`;

    console.log(`Sending HRV data to: ${ingestUrl}`);
    const response = await sendHttpRequest(ingestUrl, payload);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('HRV ingest successful');
      console.log(`Response: ${response.statusCode} - ${response.body}`);
      
      // Parse response to get ingest ID for verification
      try {
        const responseData = JSON.parse(response.body);
        if (responseData.ingestId) {
          console.log(`Ingest ID: ${responseData.ingestId}`);
          // Store ingest ID for assertion script
          process.env.E2E_INGEST_ID = responseData.ingestId;
        }
      } catch (parseError) {
        console.log('Could not parse response for ingest ID');
      }
    } else {
      console.error(`HRV ingest failed: ${response.statusCode} - ${response.body}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error sending HRV ingest:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  sendHrvIngest().catch(console.error);
}

module.exports = { sendHrvIngest };
