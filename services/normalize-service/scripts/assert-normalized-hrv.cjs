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
        "userId",
        date,
        rmssd,
        "lnRmssd",
        "capturedAt",
        "createdAt",
        "updatedAt"
      FROM hrv_data 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC 
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
    const requiredFields = ['userId', 'date', 'rmssd', 'capturedAt'];
    for (const field of requiredFields) {
      if (record[field] === null || record[field] === undefined) {
        console.error(`❌ Missing required field: ${field}`);
        process.exit(1);
      }
    }

    // Assert field values are sane
    if (record.userId !== userId) {
      console.error(`❌ Invalid userId: expected ${userId}, got ${record.userId}`);
      process.exit(1);
    }

    // Assert RMSSD is a positive number
    if (typeof record.rmssd !== 'number' || record.rmssd <= 0) {
      console.error(`❌ Invalid rmssd: ${record.rmssd}`);
      process.exit(1);
    }

    // Assert capturedAt is recent (within last hour)
    const recordTime = new Date(record.capturedAt);
    const now = new Date();
    const timeDiff = now - recordTime;
    const oneHour = 60 * 60 * 1000;

    if (timeDiff > oneHour) {
      console.error(`❌ Record capturedAt is too old: ${record.capturedAt}`);
      process.exit(1);
    }

    console.log('✅ All assertions passed!');
    console.log('📊 Record details:');
    console.log(`   - ID: ${record.id}`);
    console.log(`   - User: ${record.userId}`);
    console.log(`   - Date: ${record.date}`);
    console.log(`   - RMSSD: ${record.rmssd}`);
    console.log(`   - LN RMSSD: ${record.lnRmssd}`);
    console.log(`   - Captured At: ${record.capturedAt}`);

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
