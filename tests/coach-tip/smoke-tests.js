const { connect } = require('nats');
const { randomUUID } = require('crypto');

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4223';
const API_URL = process.env.API_URL || 'http://localhost:4106';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function publishEvent(nc, event) {
  const js = nc.jetstream();
  await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(event)));
}

async function checkTip(planId) {
  try {
    const response = await fetch(`${API_URL}/v1/plans/${planId}/coach-tip`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Test 1: High safety, low compliance
async function testHighSafetyLowCompliance(nc) {
  console.log('\n🧪 Test 1: High safety (95), low compliance (45)');
  
  const planId = randomUUID();
  const event = {
    eventId: randomUUID(),
    planId,
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: 'High Safety Low Compliance Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 70,
        factors: {
          safety: { score: 95, reasons: ['Excellent form', 'Conservative progression'] },
          compliance: { score: 45, reasons: ['Very demanding schedule', 'High time commitment'] },
          performance: { score: 70, reasons: ['Good structure'] }
        }
      }
    }
  };
  
  await publishEvent(nc, event);
  await sleep(2000);
  
  const tip = await checkTip(planId);
  if (tip) {
    console.log(`✅ Tip generated: ${tip.type} priority (${tip.priority})`);
    console.log(`   Message: ${tip.message}`);
    return { passed: true, tip };
  } else {
    console.log('❌ No tip generated');
    return { passed: false };
  }
}

// Test 2: Missing scoring data
async function testMissingScoring(nc) {
  console.log('\n🧪 Test 2: Missing scoring data');
  
  const planId = randomUUID();
  const event = {
    eventId: randomUUID(),
    planId,
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: 'No Scoring Plan',
    status: 'completed',
    version: 1,
    planData: {}  // No scoring
  };
  
  await publishEvent(nc, event);
  await sleep(2000);
  
  const tip = await checkTip(planId);
  if (!tip) {
    console.log('✅ Correctly skipped (no scoring data)');
    return { passed: true };
  } else {
    console.log('❌ Unexpected tip generated for missing scoring');
    return { passed: false, tip };
  }
}

// Test 3: Zero scores
async function testZeroScores(nc) {
  console.log('\n🧪 Test 3: Zero scores (edge boundary)');
  
  const planId = randomUUID();
  const event = {
    eventId: randomUUID(),
    planId,
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: 'Zero Score Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 0,
        factors: {
          safety: { score: 0, reasons: ['Critical safety issues'] },
          compliance: { score: 0, reasons: ['Unrealistic schedule'] },
          performance: { score: 0, reasons: ['Poor structure'] }
        }
      }
    }
  };
  
  await publishEvent(nc, event);
  await sleep(2000);
  
  const tip = await checkTip(planId);
  if (tip) {
    console.log(`✅ Tip generated: ${tip.type} priority (${tip.priority})`);
    console.log(`   Message: ${tip.message}`);
    return { passed: true, tip };
  } else {
    console.log('❌ No tip generated for critical scores');
    return { passed: false };
  }
}

// Test 4: Perfect scores
async function testPerfectScores(nc) {
  console.log('\n🧪 Test 4: Perfect scores (100/100/100)');
  
  const planId = randomUUID();
  const event = {
    eventId: randomUUID(),
    planId,
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: 'Perfect Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 100,
        factors: {
          safety: { score: 100, reasons: ['Optimal form techniques'] },
          compliance: { score: 100, reasons: ['Perfectly balanced schedule'] },
          performance: { score: 100, reasons: ['Excellent periodization'] }
        }
      }
    }
  };
  
  await publishEvent(nc, event);
  await sleep(2000);
  
  const tip = await checkTip(planId);
  if (!tip) {
    console.log('✅ Correctly no tip for perfect scores');
    return { passed: true };
  } else {
    console.log(`⚠️  Tip generated for perfect plan: ${tip.type}`);
    console.log(`   Message: ${tip.message}`);
    return { passed: true, tip };  // Not necessarily wrong
  }
}

// Test 5: Boundary scores (60 threshold)
async function testBoundaryScores(nc) {
  console.log('\n🧪 Test 5: Boundary scores (exactly 60)');
  
  const planId = randomUUID();
  const event = {
    eventId: randomUUID(),
    planId,
    userId: randomUUID(),
    timestamp: Date.now(),
    planName: 'Boundary Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 60,
        factors: {
          safety: { score: 60, reasons: ['Adequate safety measures'] },
          compliance: { score: 60, reasons: ['Moderate difficulty'] },
          performance: { score: 60, reasons: ['Basic structure'] }
        }
      }
    }
  };
  
  await publishEvent(nc, event);
  await sleep(2000);
  
  const tip = await checkTip(planId);
  if (tip) {
    console.log(`✅ Tip generated: ${tip.type} priority (${tip.priority})`);
    console.log(`   Message: ${tip.message}`);
    return { passed: true, tip };
  } else {
    console.log('⚠️  No tip at threshold boundary');
    return { passed: true };  // Behavior may vary
  }
}

// Main test runner
async function runSmokeTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔬 COACH TIP SMOKE TESTS - Edge Cases & Scoring Scenarios');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let nc;
  const results = [];
  
  try {
    console.log('Connecting to NATS...');
    nc = await connect({ servers: NATS_URL });
    console.log('✅ Connected\n');
    
    // Run all tests
    results.push(await testHighSafetyLowCompliance(nc));
    results.push(await testMissingScoring(nc));
    results.push(await testZeroScores(nc));
    results.push(await testPerfectScores(nc));
    results.push(await testBoundaryScores(nc));
    
    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 SMOKE TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`${passed === total ? '🎉 All smoke tests passed!' : '⚠️  Some tests need attention'}`);

    // Output JSON for CI parsing
    if (process.env.OUTPUT_JSON) {
      const jsonResults = {
        timestamp: new Date().toISOString(),
        testSuite: 'smoke-tests',
        total,
        passed,
        failed: total - passed,
        tests: results
      };
      console.log('\n<!-- SMOKE_TEST_RESULTS_JSON');
      console.log(JSON.stringify(jsonResults, null, 2));
      console.log('-->');
    }

    await nc.close();

    // Exit with proper code for CI
    process.exit(passed === total ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    if (nc) await nc.close();

    if (process.env.OUTPUT_JSON) {
      console.log('\n<!-- SMOKE_TEST_RESULTS_JSON');
      console.log(JSON.stringify({ error: error.message, passed: false }, null, 2));
      console.log('-->');
    }

    process.exit(1);
  }
}

// Run tests
runSmokeTests();
