const { exec } = require('child_process');
const util = require('util');
const path = require('path');

const execPromise = util.promisify(exec);

const tests = [
  {
    name: 'Smoke Tests (Edge Cases)',
    script: 'smoke-tests.js',
    description: 'Various scoring scenarios and boundary conditions'
  },
  {
    name: 'Idempotency Test',
    script: 'idempotency-test.js',
    description: 'Duplicate event handling'
  },
  {
    name: 'TTL Verification',
    script: 'ttl-test.js',
    description: 'Redis expiration settings'
  },
  {
    name: 'Load Tests',
    script: 'load-test.js',
    description: 'Burst (100 events) and sustained (10/sec for 60s) load',
    warning: 'This test takes ~90 seconds to complete'
  }
];

async function runTest(test) {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`▶️  ${test.name}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📝 ${test.description}`);
  
  if (test.warning) {
    console.log(`⚠️  ${test.warning}`);
  }
  
  console.log('\n');
  
  try {
    const scriptPath = path.join(__dirname, test.script);
    const { stdout, stderr } = await execPromise(`node "${scriptPath}"`, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for long output
    });
    
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    
    return { test: test.name, status: 'passed' };
  } catch (error) {
    console.error(`\n❌ ${test.name} failed:`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    console.error(error.message);
    
    return { test: test.name, status: 'failed', error: error.message };
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 COACH TIP SERVICE - PHASE 1 TEST SUITE');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nThis will run the following tests:');
  tests.forEach((test, i) => {
    console.log(`  ${i + 1}. ${test.name}`);
    console.log(`     ${test.description}`);
  });
  
  console.log('\n⚠️  NOTE: Load tests will take ~90 seconds');
  console.log('⚠️  Restart resilience test requires manual service restart');
  console.log('    (Run separately: node restart-resilience-test.js)\n');
  
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to begin...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Summary
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 PHASE 1 TEST SUITE - FINAL SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.status.toUpperCase()}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📊 Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}\n`);
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Phase 1 complete.');
    console.log('\n📋 Next Steps:');
    console.log('  1. Review test results above');
    console.log('  2. Run restart-resilience-test.js manually if needed');
    console.log('  3. Proceed to Phase 2: Error Handling & Observability');
  } else {
    console.log('⚠️  Some tests failed. Please review and fix before proceeding.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error running test suite:', error);
  process.exit(1);
});
