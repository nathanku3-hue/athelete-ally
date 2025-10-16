const { connect } = require('nats');
const { randomUUID } = require('crypto');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const NATS_URL = 'nats://localhost:4223';
const API_URL = 'http://localhost:4103';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function isServiceRunning() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function runRestartTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 SERVICE RESTART RESILIENCE TEST');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    // Check service is running
    console.log('🔍 Checking if service is running...');
    const running = await isServiceRunning();
    if (!running) {
      console.log('❌ Service is not running. Please start it first.');
      console.log('   Run: npm run start -w services/coach-tip-service\n');
      process.exit(1);
    }
    console.log('✅ Service is running\n');
    
    // Get initial consumer stats
    const initialStats = await getConsumerStats();
    console.log('📊 Initial consumer stats:');
    console.log(`   Delivered: ${initialStats.delivered}`);
    console.log(`   Pending: ${initialStats.pending}\n`);
    
    // Publish 5 events
    console.log('📤 Publishing 5 test events...');
    const nc = await connect({ servers: NATS_URL });
    const js = nc.jetstream();
    
    const planIds = [];
    for (let i = 0; i < 5; i++) {
      const planId = randomUUID();
      planIds.push(planId);
      
      const event = {
        eventId: randomUUID(),
        planId,
        userId: randomUUID(),
        timestamp: Date.now(),
        planName: `Restart Test Plan ${i + 1}`,
        status: 'completed',
        version: 1,
        planData: {
          scoring: {
            total: 55,
            factors: {
              safety: { score: 50, reasons: ['Test'] },
              compliance: { score: 55, reasons: ['Test'] },
              performance: { score: 60, reasons: ['Test'] }
            }
          }
        }
      };
      
      await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(event)));
    }
    
    await nc.close();
    console.log('✅ Published 5 events\n');
    
    // Wait for service to process some
    console.log('⏳ Waiting 2 seconds for initial processing...');
    await sleep(2000);
    
    const beforeRestartStats = await getConsumerStats();
    console.log('📊 Stats before restart:');
    console.log(`   Delivered: ${beforeRestartStats.delivered}`);
    console.log(`   Pending: ${beforeRestartStats.pending}\n`);
    
    // Instruct user to restart service
    console.log('═══════════════════════════════════════════════════════');
    console.log('🛑 MANUAL ACTION REQUIRED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nPlease follow these steps:');
    console.log('  1. Press Ctrl+C in the service window to stop it');
    console.log('  2. Restart with: npm run start -w services/coach-tip-service');
    console.log('  3. Wait for service to fully start');
    console.log('  4. Press Enter here to continue...\n');
    
    // Wait for user to press Enter
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    
    console.log('\n⏳ Checking if service restarted...');
    let retries = 0;
    while (retries < 10) {
      const running = await isServiceRunning();
      if (running) {
        console.log('✅ Service is running again\n');
        break;
      }
      console.log('   Waiting for service...');
      await sleep(1000);
      retries++;
    }
    
    if (retries >= 10) {
      console.log('❌ Service did not come back up');
      process.exit(1);
    }
    
    // Wait for consumer to reattach and process
    console.log('⏳ Waiting 5 seconds for consumer to reattach and process...');
    await sleep(5000);
    
    const afterRestartStats = await getConsumerStats();
    console.log('📊 Stats after restart:');
    console.log(`   Delivered: ${afterRestartStats.delivered}`);
    console.log(`   Pending: ${afterRestartStats.pending}\n`);
    
    // Verify results
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESTART RESILIENCE TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const deliveredDuringRestart = afterRestartStats.delivered - beforeRestartStats.delivered;
    
    if (afterRestartStats.pending === 0) {
      console.log('✅ PASSED: All messages processed after restart');
      console.log(`   Delivered during restart: ${deliveredDuringRestart}`);
      console.log('   Consumer successfully reattached and drained queue');
    } else if (afterRestartStats.pending <= beforeRestartStats.pending) {
      console.log('✅ PASSED: Consumer is processing messages after restart');
      console.log(`   Delivered during restart: ${deliveredDuringRestart}`);
      console.log(`   Remaining: ${afterRestartStats.pending} (may still be processing)`);
    } else {
      console.log('❌ FAILED: Consumer did not process messages after restart');
      console.log(`   Pending increased: ${beforeRestartStats.pending} → ${afterRestartStats.pending}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runRestartTest();
