#!/usr/bin/env node

/**
 * Assert normalized HRV record script for E2E testing
 * Asserts row exists and fields are sane
 */

const { Client } = require('pg');

async function assertNormalizedHrv() {
  const databaseUrl = process.env.DATABASE_URL_NORMALIZE || 'postgresql://athlete:athlete@localhost:55432/athlete_normalize';

  console.log('Asserting normalized HRV record...');

  const client = new Client({
    connectionString: databaseUrl
  });

  try {
    await client.connect();
    console.log('Connected to normalize database');

    // Query for the most recent HRV record for our test user
    const query = `
      SELECT 
        id,
        user_id,
        timestamp,
        provider,
        data_type,
        metrics,
        metadata,
        created_at,
        updated_at
      FROM normalized_data 
      WHERE user_id = $1 
        AND data_type = 'hrv'
        AND provider = 'oura'
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const userId = 'e2e-test-user';
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      console.error('❌ No normalized HRV record found for test user');
      process.exit(1);
    }

    const record = result.rows[0];
    console.log('✅ Found normalized HRV record:', record.id);

    // Assert required fields exist
    const requiredFields = ['user_id', 'timestamp', 'provider', 'data_type', 'metrics'];
    for (const field of requiredFields) {
      if (!record[field]) {
        console.error(`❌ Missing required field: ${field}`);
        process.exit(1);
      }
    }

    // Assert field values are sane
    if (record.user_id !== userId) {
      console.error(`❌ Invalid user_id: expected ${userId}, got ${record.user_id}`);
      process.exit(1);
    }

    if (record.provider !== 'oura') {
      console.error(`❌ Invalid provider: expected 'oura', got '${record.provider}'`);
      process.exit(1);
    }

    if (record.data_type !== 'hrv') {
      console.error(`❌ Invalid data_type: expected 'hrv', got '${record.data_type}'`);
      process.exit(1);
    }

    // Assert metrics structure
    const metrics = record.metrics;
    if (typeof metrics !== 'object' || metrics === null) {
      console.error('❌ Metrics should be an object');
      process.exit(1);
    }

    const expectedMetrics = ['rmssd', 'sdnn', 'pnn50', 'lf', 'hf', 'lfHfRatio'];
    for (const metric of expectedMetrics) {
      if (typeof metrics[metric] !== 'number' || metrics[metric] <= 0) {
        console.error(`❌ Invalid metric ${metric}: ${metrics[metric]}`);
        process.exit(1);
      }
    }

    // Assert timestamp is recent (within last hour)
    const recordTime = new Date(record.timestamp);
    const now = new Date();
    const timeDiff = now - recordTime;
    const oneHour = 60 * 60 * 1000;

    if (timeDiff > oneHour) {
      console.error(`❌ Record timestamp is too old: ${record.timestamp}`);
      process.exit(1);
    }

    console.log('✅ All assertions passed!');
    console.log('📊 Record details:');
    console.log(`   - ID: ${record.id}`);
    console.log(`   - User: ${record.user_id}`);
    console.log(`   - Provider: ${record.provider}`);
    console.log(`   - Type: ${record.data_type}`);
    console.log(`   - Timestamp: ${record.timestamp}`);
    console.log(`   - RMSSD: ${metrics.rmssd}`);
    console.log(`   - SDNN: ${metrics.sdnn}`);
    console.log(`   - LF/HF Ratio: ${metrics.lfHfRatio}`);

  } catch (error) {
    console.error('Error asserting normalized HRV record:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  assertNormalizedHrv().catch(console.error);
}

module.exports = { assertNormalizedHrv };
