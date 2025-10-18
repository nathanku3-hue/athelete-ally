const { spawn } = require('child_process');
const path = require('path');
const { cleanupRedis, cleanupNATSConsumer } = require('./test-cleanup.js');

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4223';
const API_URL = process.env.API_URL || 'http://localhost:4103';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// CI mode: run scaled-down tests
const CI_MODE = process.env.CI === 'true';

/**
 * Run a test script and capture results
 */
async function runTest(scriptName, displayName) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🧪 Running: ${displayName}`);
  console.log(`${'═'.repeat(60)}\n`);

  const scriptPath = path.join(__dirname, scriptName);
  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], {
      env: {
        ...process.env,
        NATS_URL,
        API_URL,
        REDIS_URL,
        OUTPUT_JSON: 'true',
        CI: CI_MODE ? 'true' : 'false',
        LOAD_TEST_MODE: CI_MODE ? 'ci' : 'full'
      },
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const passed = code === 0;

      // Try to extract JSON results
      let jsonResults = null;
      const jsonMatch = stdout.match(/<!-- .*?_RESULTS_JSON\s*([\s\S]*?)-->/);
      if (jsonMatch) {
        try {
          jsonResults = JSON.parse(jsonMatch[1]);
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      resolve({
        testName: scriptName,
        displayName,
        passed,
        exitCode: code,
        duration,
        stdout,
        stderr,
        jsonResults
      });
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        testName: scriptName,
        displayName,
        passed: false,
        exitCode: -1,
        duration,
        error: error.message,
        stdout,
        stderr
      });
    });
  });
}

/**
 * Wait for service health check
 */
async function waitForService(maxAttempts = 30, delayMs = 1000) {
  console.log('\n⏳ Waiting for coach-tip-service to be healthy...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        const health = await response.json();
        if (health.status === 'healthy') {
          console.log('✅ Service is healthy\n');
          return true;
        }
      }
    } catch (error) {
      // Service not ready yet
    }

    process.stdout.write(`   Attempt ${i + 1}/${maxAttempts}...\r`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.error('\n❌ Service health check timeout');
  return false;
}

/**
 * Main test orchestrator
 */
async function runCITests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          COACH TIP SERVICE - CI TEST SUITE                 ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nMode: ${CI_MODE ? 'CI (scaled-down tests)' : 'Full (local validation)'}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const results = {
    mode: CI_MODE ? 'ci' : 'full',
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    }
  };

  const overallStartTime = Date.now();

  try {
    // Step 1: Check service health
    const serviceHealthy = await waitForService();
    if (!serviceHealthy) {
      throw new Error('Service health check failed - cannot proceed with tests');
    }

    // Step 2: Run smoke tests (cleanup was done before service start)
    const smokeResult = await runTest('smoke-tests.js', 'Smoke Tests (Edge Cases)');
    results.tests.push(smokeResult);

    if (!smokeResult.passed) {
      console.log('\n⚠️  Smoke tests failed - continuing with remaining tests\n');
    }

    // Step 3: Run idempotency test
    const idempotencyResult = await runTest('idempotency-test.js', 'Idempotency Test');
    results.tests.push(idempotencyResult);

    // Step 4: Run TTL verification test
    const ttlResult = await runTest('ttl-test.js', 'TTL Verification Test');
    results.tests.push(ttlResult);

    // Step 5: Run load tests
    const loadResult = await runTest('load-test.js', `Load Tests (${CI_MODE ? 'CI Mode' : 'Full Mode'})`);
    results.tests.push(loadResult);

    // Step 6: Calculate summary
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.tests.filter(t => !t.passed).length;
    results.summary.duration = Date.now() - overallStartTime;

    // Step 7: Display summary
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║                     TEST SUMMARY                           ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`Total Tests:    ${results.summary.total}`);
    console.log(`✅ Passed:      ${results.summary.passed}`);
    console.log(`❌ Failed:      ${results.summary.failed}`);
    console.log(`⏱️  Duration:    ${(results.summary.duration / 1000).toFixed(2)}s\n`);

    console.log('Test Results:');
    console.log('─'.repeat(60));
    results.tests.forEach((test, index) => {
      const status = test.passed ? '✅' : '❌';
      const duration = (test.duration / 1000).toFixed(2);
      console.log(`${index + 1}. ${status} ${test.displayName} (${duration}s)`);
    });
    console.log('─'.repeat(60));

    // Step 8: Performance metrics (if available from load test)
    const loadTestResults = results.tests.find(t => t.testName === 'load-test.js');
    if (loadTestResults && loadTestResults.jsonResults) {
      console.log('\n📊 Performance Metrics:');
      console.log('─'.repeat(60));

      const burstTest = loadTestResults.jsonResults.tests?.find(t => t.testName === 'burst');
      const sustainedTest = loadTestResults.jsonResults.tests?.find(t => t.testName === 'sustained');

      if (burstTest) {
        console.log(`Burst Test (${burstTest.published} events):`);
        console.log(`  Process throughput: ${burstTest.processThroughput.toFixed(2)} events/sec`);
        console.log(`  Final lag: ${burstTest.finalLag} events`);
        console.log(`  Errors: ${burstTest.errors}`);
      }

      if (sustainedTest) {
        console.log(`Sustained Test (${sustainedTest.published} events):`);
        console.log(`  Max lag: ${sustainedTest.maxLag} events`);
        console.log(`  Avg lag: ${sustainedTest.avgLag.toFixed(2)} events`);
        console.log(`  Errors: ${sustainedTest.errors}`);
      }
      console.log('─'.repeat(60));
    }

    // Step 9: Overall result
    const allPassed = results.summary.failed === 0;
    results.passed = allPassed;

    console.log('\n');
    if (allPassed) {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║                                                            ║');
      console.log('║                  ✅ ALL TESTS PASSED ✅                    ║');
      console.log('║                                                            ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
    } else {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║                                                            ║');
      console.log('║                  ❌ SOME TESTS FAILED ❌                   ║');
      console.log('║                                                            ║');
      console.log('╚════════════════════════════════════════════════════════════╝');

      console.log('\n⚠️  Failed Tests:');
      results.tests.filter(t => !t.passed).forEach(test => {
        console.log(`   - ${test.displayName}`);
        if (test.error) {
          console.log(`     Error: ${test.error}`);
        }
      });
    }

    // Step 10: Output JSON for CI parsing
    console.log('\n<!-- CI_TEST_RESULTS_JSON');
    console.log(JSON.stringify(results, null, 2));
    console.log('-->');

    // Step 11: Cleanup after tests
    console.log('\n🧹 Cleaning up test data after tests...');
    await cleanupRedis();
    console.log('✅ Final cleanup complete\n');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n\n❌ Test suite failed with unexpected error:', error);
    results.passed = false;
    results.error = error.message;
    results.summary.duration = Date.now() - overallStartTime;

    console.log('\n<!-- CI_TEST_RESULTS_JSON');
    console.log(JSON.stringify(results, null, 2));
    console.log('-->');

    process.exit(1);
  }
}

// Run the test suite
runCITests();
