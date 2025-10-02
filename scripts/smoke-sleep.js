#!/usr/bin/env node

/**
 * Sleep E2E Smoke Test
 *
 * Tests the complete Sleep event flow:
 * - Ingest endpoint validation
 * - Event publishing to NATS
 * - Normalization with DB persistence
 * - DLQ routing for invalid events
 *
 * Environment Variables:
 * - INGEST_BASE_URL: Ingest service base URL (default: http://localhost:4101)
 * - NATS_URL: NATS server URL (default: nats://localhost:4223)
 * - DATABASE_URL: PostgreSQL connection string (for DB verification)
 * - STREAM_NAME: Override stream for verification (default: try AA_CORE_HOT then ATHLETE_ALLY_EVENTS)
 * - E2E_USER: Test user ID (default: smoke-user)
 * - E2E_DATE: Test date (default: today)
 * - CI_SKIP_E2E: Skip test if infrastructure unavailable (exit 0 with SKIP)
 *
 * CI Integration:
 * - Run with CI_E2E=1 to execute tests when infrastructure is available
 * - Run with CI_SKIP_E2E=1 to skip gracefully when infrastructure is unavailable
 * - npm script: `npm run e2e:sleep`
 *
 * Exit Codes:
 * 0: All tests passed or skipped (CI_SKIP_E2E=1)
 * 1: Tests failed
 * 2: Infrastructure unavailable (unless CI_SKIP_E2E=1)
 */

const { spawn } = require('child_process');
const ingestBase = process.env.INGEST_BASE_URL || 'http://localhost:4101';
const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
const databaseUrl = process.env.DATABASE_URL;
const streamName = process.env.STREAM_NAME; // Optional: override stream for verification
const e2eUser = process.env.E2E_USER || 'smoke-user';
const e2eDate = process.env.E2E_DATE || new Date().toISOString().slice(0, 10);
const ciSkipE2E = process.env.CI_SKIP_E2E === '1';

// Test result tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  results.total++;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n[${results.total}] ${status}: ${name}`);
  if (details) console.log(`    ${details}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

function logSkip(reason) {
  console.log(`\n⏭️  SKIP: ${reason}`);
  results.skipped++;
}

async function post(path, body) {
  try {
    const res = await fetch(`${ingestBase}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    let data;
    try { data = JSON.parse(txt); } catch { data = txt; }
    return { status: res.status, data };
  } catch (err) {
    if (ciSkipE2E) {
      logSkip(`Ingest service unreachable: ${err.message}`);
      return null;
    }
    throw err;
  }
}

async function runDbAssert() {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      DATABASE_URL: databaseUrl,
      E2E_USER: e2eUser,
      E2E_DATE: e2eDate
    };

    const proc = spawn('node', ['scripts/ci/assert-normalized-sleep.js'], {
      env,
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout });
      } else {
        resolve({ success: false, output: stderr || stdout, exitCode: code });
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

(async () => {
  console.log('='.repeat(60));
  console.log('Sleep E2E Smoke Test');
  console.log('='.repeat(60));
  console.log(`Config:`);
  console.log(`  Ingest: ${ingestBase}`);
  console.log(`  NATS:   ${natsUrl}`);
  console.log(`  Stream: ${streamName || 'AA_CORE_HOT → ATHLETE_ALLY_EVENTS (auto-detect)'}`);
  console.log(`  DB:     ${databaseUrl ? 'configured' : 'not configured'}`);
  console.log(`  User:   ${e2eUser}`);
  console.log(`  Date:   ${e2eDate}`);
  console.log('='.repeat(60));

  // Test 1: Valid Sleep payload
  console.log('\n--- Test 1: Valid Sleep Payload ---');
  const valid = await post('/ingest/sleep', {
    userId: e2eUser,
    date: e2eDate,
    durationMinutes: 420,
  });

  if (valid === null && ciSkipE2E) {
    console.log('\nCI_SKIP_E2E=1: Infrastructure unavailable, skipping remaining tests');
    process.exit(0);
  }

  logTest(
    'Valid Sleep payload accepted',
    valid.status >= 200 && valid.status < 300,
    `Status: ${valid.status}, Response: ${JSON.stringify(valid.data)}`
  );

  // Test 2: Missing durationMinutes
  console.log('\n--- Test 2: Missing durationMinutes ---');
  const missingDuration = await post('/ingest/sleep', {
    userId: e2eUser,
    date: e2eDate,
  });
  logTest(
    'Missing durationMinutes rejected (400)',
    missingDuration.status === 400,
    `Status: ${missingDuration.status}, Response: ${JSON.stringify(missingDuration.data)}`
  );

  // Test 3: Negative durationMinutes
  console.log('\n--- Test 3: Negative durationMinutes ---');
  const negativeDuration = await post('/ingest/sleep', {
    userId: e2eUser,
    date: e2eDate,
    durationMinutes: -100,
  });
  logTest(
    'Negative durationMinutes rejected (400)',
    negativeDuration.status === 400,
    `Status: ${negativeDuration.status}, Response: ${JSON.stringify(negativeDuration.data)}`
  );

  // Test 4: Missing date
  console.log('\n--- Test 4: Missing date ---');
  const missingDate = await post('/ingest/sleep', {
    userId: e2eUser,
    durationMinutes: 420,
  });
  logTest(
    'Missing date rejected (400)',
    missingDate.status === 400,
    `Status: ${missingDate.status}, Response: ${JSON.stringify(missingDate.data)}`
  );

  // Test 5: Valid with raw metadata (vendor + qualityScore)
  console.log('\n--- Test 5: Valid with raw metadata ---');
  const withMetadata = await post('/ingest/sleep', {
    userId: e2eUser,
    date: e2eDate,
    durationMinutes: 480,
    raw: {
      source: 'oura',
      qualityScore: 150  // Should be clamped to 100
    }
  });
  logTest(
    'Valid with raw metadata accepted',
    withMetadata.status >= 200 && withMetadata.status < 300,
    `Status: ${withMetadata.status}, Response: ${JSON.stringify(withMetadata.data)}`
  );

  // Test 6: Duplicate userId+date (upsert behavior)
  console.log('\n--- Test 6: Duplicate userId+date (upsert) ---');
  const duplicate = await post('/ingest/sleep', {
    userId: e2eUser,
    date: e2eDate,
    durationMinutes: 390,  // Different duration
  });
  logTest(
    'Duplicate userId+date accepted (upsert)',
    duplicate.status >= 200 && duplicate.status < 300,
    `Status: ${duplicate.status}, Response: ${JSON.stringify(duplicate.data)}`
  );

  // Wait for async processing (normalize service needs time)
  console.log('\n--- Waiting for normalization (2s) ---');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 7: NATS - Verify DLQ for schema-invalid
  console.log('\n--- Test 7: NATS DLQ Verification ---');
  try {
    const { connect } = await import('nats');
    const nc = await connect({ servers: natsUrl });
    const jsm = await nc.jetstreamManager();

    let dlqFound = false;
    try {
      const msg = await jsm.streams.getMessage('AA_DLQ', {
        last_by_subj: 'dlq.normalize.sleep.raw-received.schema-invalid'
      });
      dlqFound = !!msg;
      if (dlqFound) {
        const eventData = JSON.parse(new TextDecoder().decode(msg.data));
        console.log(`    DLQ message found (seq: ${msg.seq})`);
        console.log(`    Event: ${JSON.stringify({ ...eventData, userId: 'present' })}`);
      }
    } catch (e) {
      console.log(`    DLQ query failed (expected if no invalid messages yet): ${e.message}`);
    }

    logTest(
      'DLQ contains schema-invalid messages',
      dlqFound,
      dlqFound ? 'Schema-invalid message found in DLQ' : 'No schema-invalid messages (may be OK if no validation failures)'
    );

    // Test 8: NATS - Verify SleepNormalizedStored published
    console.log('\n--- Test 8: Verify SleepNormalizedStored Published ---');
    let normalizedFound = false;
    let foundInStream = null;

    // Determine streams to try
    const streamsToTry = streamName
      ? [streamName]
      : ['AA_CORE_HOT', 'ATHLETE_ALLY_EVENTS'];

    for (const stream of streamsToTry) {
      try {
        console.log(`    Trying stream: ${stream}...`);
        const msg = await jsm.streams.getMessage(stream, {
          last_by_subj: 'athlete-ally.sleep.normalized-stored'
        });
        normalizedFound = !!msg;
        foundInStream = stream;
        if (normalizedFound) {
          const eventData = JSON.parse(new TextDecoder().decode(msg.data));
          console.log(`    ✅ Normalized event found in ${stream} (seq: ${msg.seq})`);
          console.log(`    Record: ${JSON.stringify({ ...eventData.record, userId: 'present' })}`);
          break; // Found it, no need to try other streams
        }
      } catch (e) {
        console.log(`    Stream ${stream}: ${e.message}`);
        // Continue to next stream
      }
    }

    logTest(
      'SleepNormalizedStored event published',
      normalizedFound,
      normalizedFound
        ? `Normalized event found in stream ${foundInStream}`
        : `Normalized event not found in any stream (${streamsToTry.join(', ')})`
    );

    await nc.close();
  } catch (err) {
    if (ciSkipE2E) {
      logSkip(`NATS unavailable: ${err.message}`);
    } else {
      logTest('NATS verification', false, `Error: ${err.message}`);
    }
  }

  // Test 9: Database verification
  console.log('\n--- Test 9: Database Verification ---');
  if (!databaseUrl) {
    logSkip('DATABASE_URL not configured');
  } else {
    try {
      const dbResult = await runDbAssert();
      logTest(
        'Sleep row persisted in database',
        dbResult.success,
        dbResult.success
          ? dbResult.output.trim()
          : `DB assertion failed (exit ${dbResult.exitCode}): ${dbResult.output}`
      );
    } catch (err) {
      if (ciSkipE2E) {
        logSkip(`Database unavailable: ${err.message}`);
      } else {
        logTest('Database verification', false, `Error: ${err.message}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Total:   ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log('='.repeat(60));

  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}`);
      if (t.details) console.log(`     ${t.details}`);
    });
    console.log('\nSmoke test FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
})();
