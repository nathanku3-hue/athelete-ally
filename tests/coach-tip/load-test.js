const { connect } = require('nats');
const { randomUUID } = require('crypto');

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4223';
const API_URL = process.env.API_URL || 'http://localhost:4103';

// CI mode: scaled-down event counts for faster CI runs
const CI_MODE = process.env.CI === 'true' || process.env.LOAD_TEST_MODE === 'ci';

const CONFIG = CI_MODE ? {
  burst: {
    events: 10,
    waitTime: 5000 // 5 seconds
  },
  sustained: {
    events: 30,
    duration: 15, // 15 seconds
    waitTime: 5000 // 5 seconds
  }
} : {
  burst: {
    events: 100,
    waitTime: 10000 // 10 seconds
  },
  sustained: {
    events: 600,
    duration: 60, // 60 seconds
    waitTime: 10000 // 10 seconds
  }
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createTestEvent(index) {
  return {
    eventId: randomUUID(),
    planId: randomUUID(),
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: `Load Test Plan ${index}`,
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 60 + (index % 20),
        factors: {
          safety: { score: 55 + (index % 30), reasons: ['Load test safety'] },
          compliance: { score: 60 + (index % 25), reasons: ['Load test compliance'] },
          performance: { score: 65 + (index % 20), reasons: ['Load test performance'] }
        }
      }
    }
  };
}

async function getConsumerStats() {
  try {
    const nc = await connect({ servers: NATS_URL });
    const jsm = await nc.jetstreamManager();
    const info = await jsm.consumers.info('ATHLETE_ALLY_EVENTS', 'coach-tip-plan-gen-consumer');
    await nc.close();
    return {
      delivered: info.delivered.stream_seq,
      pending: info.num_pending,
      ackPending: info.num_ack_pending
    };
  } catch (error) {
    return null;
  }
}

async function getServiceMetrics() {
  try {
    const response = await fetch(`${API_URL}/metrics`);
    if (!response.ok) return null;
    const text = await response.text();

    // Parse key metrics
    const metrics = {};
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;

      // Extract tip generation metrics
      if (line.includes('coach_tip_tips_generated_total')) {
        const match = line.match(/coach_tip_tips_generated_total.*?\s+(\d+)/);
        if (match) {
          metrics.tipsGenerated = (metrics.tipsGenerated || 0) + parseInt(match[1]);
        }
      }

      // Extract skip metrics
      if (line.includes('coach_tip_tips_skipped_total')) {
        const match = line.match(/coach_tip_tips_skipped_total.*?\s+(\d+)/);
        if (match) {
          metrics.tipsSkipped = (metrics.tipsSkipped || 0) + parseInt(match[1]);
        }
      }

      // Extract error metrics
      if (line.includes('coach_tip_processing_errors_total')) {
        const match = line.match(/coach_tip_processing_errors_total.*?\s+(\d+)/);
        if (match) {
          metrics.errors = (metrics.errors || 0) + parseInt(match[1]);
        }
      }
    }

    return metrics;
  } catch (error) {
    console.warn('Failed to fetch service metrics:', error.message);
    return null;
  }
}

// Test 1: Burst load
async function runBurstTest() {
  const eventCount = CONFIG.burst.events;
  const waitTime = CONFIG.burst.waitTime;

  console.log(`\n🚀 BURST TEST: ${eventCount} events as fast as possible ${CI_MODE ? '(CI MODE)' : ''}`);
  console.log('─────────────────────────────────────────────────────\n');

  const nc = await connect({ servers: NATS_URL });
  const js = nc.jetstream();

  const startStats = await getConsumerStats();
  const startMetrics = await getServiceMetrics();
  const startTime = Date.now();

  console.log(`📤 Publishing ${eventCount} events...`);
  const publishPromises = [];

  for (let i = 0; i < eventCount; i++) {
    const event = createTestEvent(i);
    const promise = js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(event)));
    publishPromises.push(promise);
  }

  await Promise.all(publishPromises);
  const publishDuration = Date.now() - startTime;

  console.log(`✅ Published ${eventCount} events in ${publishDuration}ms`);
  console.log(`   Throughput: ${(eventCount / (publishDuration / 1000)).toFixed(2)} events/sec\n`);

  console.log(`⏳ Waiting ${waitTime / 1000} seconds for consumer to process...`);
  await sleep(waitTime);

  const endStats = await getConsumerStats();
  const endMetrics = await getServiceMetrics();

  console.log('\n📊 Consumer Stats:');
  console.log(`   Delivered: ${endStats.delivered} (Δ ${endStats.delivered - startStats.delivered})`);
  console.log(`   Pending: ${endStats.pending}`);
  console.log(`   Ack Pending: ${endStats.ackPending}`);

  if (endMetrics && startMetrics) {
    console.log('\n📈 Service Metrics:');
    console.log(`   Tips Generated: ${(endMetrics.tipsGenerated || 0) - (startMetrics.tipsGenerated || 0)}`);
    console.log(`   Tips Skipped: ${(endMetrics.tipsSkipped || 0) - (startMetrics.tipsSkipped || 0)}`);
    console.log(`   Errors: ${(endMetrics.errors || 0) - (startMetrics.errors || 0)}`);
  }

  const processed = endStats.delivered - startStats.delivered;
  const processDuration = Date.now() - startTime;

  console.log(`\n✅ Processed ${processed}/${eventCount} events in ${(processDuration / 1000).toFixed(2)}s`);
  console.log(`   Consumer throughput: ${(processed / (processDuration / 1000)).toFixed(2)} events/sec`);

  await nc.close();

  const tipsGenerated = endMetrics && startMetrics ?
    (endMetrics.tipsGenerated || 0) - (startMetrics.tipsGenerated || 0) : null;
  const errors = endMetrics && startMetrics ?
    (endMetrics.errors || 0) - (startMetrics.errors || 0) : 0;

  return {
    testName: 'burst',
    published: eventCount,
    processed,
    tipsGenerated,
    errors,
    publishDuration,
    processDuration,
    publishThroughput: eventCount / (publishDuration / 1000),
    processThroughput: processed / (processDuration / 1000),
    finalLag: endStats.pending + endStats.ackPending,
    passed: processed === eventCount && errors === 0
  };
}

// Test 2: Sustained load
async function runSustainedTest() {
  const targetEvents = CONFIG.sustained.events;
  const duration = CONFIG.sustained.duration;
  const waitTime = CONFIG.sustained.waitTime;
  const targetInterval = (duration * 1000) / targetEvents; // ms between events

  console.log(`\n\n⏱️  SUSTAINED TEST: ${targetEvents} events over ${duration} seconds ${CI_MODE ? '(CI MODE)' : ''}`);
  console.log('─────────────────────────────────────────────────────\n');

  const nc = await connect({ servers: NATS_URL });
  const js = nc.jetstream();

  const startStats = await getConsumerStats();
  const startMetrics = await getServiceMetrics();
  const startTime = Date.now();

  console.log(`📤 Publishing ${targetEvents} events over ${duration} seconds...`);
  console.log('   (Press Ctrl+C to stop early)\n');

  let published = 0;
  const lagSamples = [];
  const sampleInterval = Math.max(5, Math.floor(targetEvents / 5)); // Sample 5 times

  for (let i = 0; i < targetEvents; i++) {
    const event = createTestEvent(i);
    await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(event)));
    published++;

    // Sample consumer lag periodically
    if (i % sampleInterval === 0 && i > 0) {
      const stats = await getConsumerStats();
      const lag = stats.pending + stats.ackPending;
      lagSamples.push({ time: (Date.now() - startTime) / 1000, lag, delivered: stats.delivered });

      console.log(`   ${(Date.now() - startTime) / 1000}s: Published ${i}, Consumer delivered ${stats.delivered}, Lag: ${lag}`);
    }

    await sleep(targetInterval);
  }

  const publishDuration = Date.now() - startTime;

  console.log(`\n✅ Published ${published} events in ${(publishDuration / 1000).toFixed(2)}s`);
  console.log(`   Average rate: ${(published / (publishDuration / 1000)).toFixed(2)} events/sec\n`);

  console.log(`⏳ Waiting ${waitTime / 1000} seconds for consumer to catch up...`);
  await sleep(waitTime);

  const endStats = await getConsumerStats();
  const endMetrics = await getServiceMetrics();
  const totalDuration = Date.now() - startTime;

  console.log('\n📊 Final Stats:');
  console.log(`   Published: ${published}`);
  console.log(`   Delivered: ${endStats.delivered} (Δ ${endStats.delivered - startStats.delivered})`);
  console.log(`   Pending: ${endStats.pending}`);
  console.log(`   Ack Pending: ${endStats.ackPending}`);
  console.log(`   Total duration: ${(totalDuration / 1000).toFixed(2)}s`);

  if (endMetrics && startMetrics) {
    console.log('\n📈 Service Metrics:');
    console.log(`   Tips Generated: ${(endMetrics.tipsGenerated || 0) - (startMetrics.tipsGenerated || 0)}`);
    console.log(`   Tips Skipped: ${(endMetrics.tipsSkipped || 0) - (startMetrics.tipsSkipped || 0)}`);
    console.log(`   Errors: ${(endMetrics.errors || 0) - (startMetrics.errors || 0)}`);
  }

  if (lagSamples.length > 0) {
    console.log('\n📈 Consumer Lag Over Time:');
    lagSamples.forEach(sample => {
      console.log(`   ${sample.time.toFixed(0)}s: Delivered ${sample.delivered}, Lag ${sample.lag}`);
    });
  }

  await nc.close();

  const tipsGenerated = endMetrics && startMetrics ?
    (endMetrics.tipsGenerated || 0) - (startMetrics.tipsGenerated || 0) : null;
  const errors = endMetrics && startMetrics ?
    (endMetrics.errors || 0) - (startMetrics.errors || 0) : 0;
  const processed = endStats.delivered - startStats.delivered;
  const maxLag = lagSamples.length > 0 ? Math.max(...lagSamples.map(s => s.lag)) : 0;
  const avgLag = lagSamples.length > 0 ?
    lagSamples.reduce((sum, s) => sum + s.lag, 0) / lagSamples.length : 0;

  return {
    testName: 'sustained',
    published,
    processed,
    tipsGenerated,
    errors,
    publishDuration,
    totalDuration,
    maxLag,
    avgLag,
    finalLag: endStats.pending + endStats.ackPending,
    passed: processed === published && errors === 0 && maxLag < 100
  };
}

// Main test runner
async function runLoadTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`⚡ COACH TIP LOAD TESTS ${CI_MODE ? '(CI MODE)' : '(FULL MODE)'}`);
  console.log('═══════════════════════════════════════════════════════');

  if (CI_MODE) {
    console.log('\n📌 Running in CI mode with scaled-down event counts');
    console.log(`   Burst: ${CONFIG.burst.events} events`);
    console.log(`   Sustained: ${CONFIG.sustained.events} events over ${CONFIG.sustained.duration}s\n`);
  }

  const results = {
    mode: CI_MODE ? 'ci' : 'full',
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    const burstResults = await runBurstTest();
    results.tests.push(burstResults);

    const sustainedResults = await runSustainedTest();
    results.tests.push(sustainedResults);

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📊 LOAD TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`BURST TEST (${burstResults.published} events):`);
    console.log(`  ✅ Published: ${burstResults.published} events in ${burstResults.publishDuration}ms`);
    console.log(`  ✅ Processed: ${burstResults.processed} events in ${(burstResults.processDuration / 1000).toFixed(2)}s`);
    if (burstResults.tipsGenerated !== null) {
      console.log(`  📊 Tips generated: ${burstResults.tipsGenerated}`);
    }
    console.log(`  📊 Publish throughput: ${burstResults.publishThroughput.toFixed(2)} events/sec`);
    console.log(`  📊 Process throughput: ${burstResults.processThroughput.toFixed(2)} events/sec`);
    console.log(`  📊 Final lag: ${burstResults.finalLag} events`);
    console.log(`  ${burstResults.passed ? '✅ PASSED' : '❌ FAILED'}\n`);

    console.log(`SUSTAINED TEST (${sustainedResults.published} events over ${CONFIG.sustained.duration}s):`);
    console.log(`  ✅ Published: ${sustainedResults.published} events`);
    console.log(`  ✅ Processed: ${sustainedResults.processed} events`);
    if (sustainedResults.tipsGenerated !== null) {
      console.log(`  📊 Tips generated: ${sustainedResults.tipsGenerated}`);
    }
    console.log(`  📊 Max consumer lag: ${sustainedResults.maxLag} events`);
    console.log(`  📊 Avg consumer lag: ${sustainedResults.avgLag.toFixed(2)} events`);
    console.log(`  📊 Final lag: ${sustainedResults.finalLag} events`);

    if (sustainedResults.maxLag < 50) {
      console.log('  🎉 EXCELLENT: Consumer kept up with sustained load!');
    } else if (sustainedResults.maxLag < 100) {
      console.log('  ✅ GOOD: Consumer handled sustained load with acceptable lag');
    } else {
      console.log('  ⚠️  WARNING: Consumer lagged significantly during sustained load');
    }
    console.log(`  ${sustainedResults.passed ? '✅ PASSED' : '❌ FAILED'}\n`);

    // Overall result
    const allPassed = results.tests.every(t => t.passed);
    results.passed = allPassed;
    results.totalErrors = results.tests.reduce((sum, t) => sum + t.errors, 0);

    console.log('═══════════════════════════════════════════════════════');
    console.log(`OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log(`Total errors: ${results.totalErrors}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Output JSON for CI parsing
    if (process.env.OUTPUT_JSON) {
      console.log('\n<!-- LOAD_TEST_RESULTS_JSON');
      console.log(JSON.stringify(results, null, 2));
      console.log('-->');
    }

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Load test failed:', error);
    results.passed = false;
    results.error = error.message;

    if (process.env.OUTPUT_JSON) {
      console.log('\n<!-- LOAD_TEST_RESULTS_JSON');
      console.log(JSON.stringify(results, null, 2));
      console.log('-->');
    }

    process.exit(1);
  }
}

// Run tests
runLoadTests();
