const { connect } = require('nats');
const { randomUUID } = require('crypto');

const NATS_URL = 'nats://localhost:4223';
const API_URL = 'http://localhost:4103';

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

async function runIdempotencyTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔁 IDEMPOTENCY TEST - Duplicate Event Handling');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let nc;
  
  try {
    console.log('Connecting to NATS...');
    nc = await connect({ servers: NATS_URL });
    console.log('✅ Connected\n');
    
    const planId = randomUUID();
    const userId = randomUUID();
    
    const event = {
      eventId: randomUUID(),
      planId,
      userId,
      timestamp: Date.now(),
      planName: 'Idempotency Test Plan',
      status: 'completed',
      version: 1,
      planData: {
        scoring: {
          total: 65,
          factors: {
            safety: { score: 55, reasons: ['Some safety concerns'] },
            compliance: { score: 70, reasons: ['Moderate schedule'] },
            performance: { score: 70, reasons: ['Good structure'] }
          }
        }
      }
    };
    
    console.log('📤 Publishing event #1 (planId:', planId + ')');
    await publishEvent(nc, event);
    
    console.log('⏳ Waiting 2 seconds for processing...');
    await sleep(2000);
    
    const tip1 = await checkTip(planId);
    if (!tip1) {
      console.log('❌ First event did not generate a tip');
      await nc.close();
      process.exit(1);
    }
    
    console.log('✅ First tip generated:', tip1.id);
    console.log(`   Type: ${tip1.type}, Priority: ${tip1.priority}\n`);
    
    // Publish duplicate with same planId but different eventId
    event.eventId = randomUUID();  // New event ID
    event.timestamp = Date.now();   // New timestamp
    
    console.log('📤 Publishing event #2 (same planId, different eventId)');
    await publishEvent(nc, event);
    
    console.log('⏳ Waiting 2 seconds for processing...');
    await sleep(2000);
    
    const tip2 = await checkTip(planId);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 IDEMPOTENCY TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    if (tip2.id === tip1.id) {
      console.log('✅ PASSED: Same tip returned (duplicate event ignored)');
      console.log(`   Tip ID unchanged: ${tip1.id}`);
      console.log(`   Generated at: ${tip1.generatedAt}`);
    } else {
      console.log('❌ FAILED: Different tip created');
      console.log(`   First tip:  ${tip1.id}`);
      console.log(`   Second tip: ${tip2.id}`);
      console.log('\n⚠️  Expected: Service should skip duplicate planId');
    }
    
    await nc.close();
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    if (nc) await nc.close();
    process.exit(1);
  }
}

runIdempotencyTest();
