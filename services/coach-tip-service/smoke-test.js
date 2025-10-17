// Complete smoke test for CoachTip Stream 5 integration
import { connect } from 'nats';
import { randomUUID } from 'crypto';

async function smokeTest() {
  console.log('🧪 CoachTip Stream 5 Smoke Test\n');
  
  // Test 1: Service Health
  console.log('[1/5] Checking CoachTip service health...');
  const healthRes = await fetch('http://localhost:4103/health');
  const health = await healthRes.json();
  console.log(`✅ Service healthy: ${health.status}`);
  console.log(`   - Redis: ${health.components.redis}`);
  console.log(`   - Subscriber: ${health.components.subscriber}\n`);
  
  // Test 2: Check NATS/JetStream
  console.log('[2/5] Verifying NATS JetStream...');
  const nc = await connect({ servers: 'nats://localhost:4223' });
  const jsm = await nc.jetstreamManager();
  const streams = await jsm.streams.list().next();
  console.log(`✅ JetStream enabled with ${streams.length} stream(s)`);
  
  // Check if ATHLETE_ALLY_EVENTS stream exists
  try {
    const streamInfo = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
    console.log(`   - Stream: ${streamInfo.config.name}`);
    console.log(`   - Messages: ${streamInfo.state.messages}`);
    console.log(`   - Consumers: ${streamInfo.state.num_consumers}\n`);
  } catch (e) {
    console.log('⚠️  ATHLETE_ALLY_EVENTS stream not found\n');
  }
  
  // Test 3: Publish plan_generated event
  console.log('[3/5] Publishing test plan_generated event...');
  const js = nc.jetstream();
  const planId = randomUUID();
  const testEvent = {
    eventId: randomUUID(),
    userId: '550e8400-e29b-41d4-a716-446655440000',
    planId,
    timestamp: Date.now(),
    planName: 'E2E Test Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 68.5,
        factors: {
          safety: { score: 65, issues: ['High volume progression'] },
          compliance: { score: 78, issues: [] },
          performance: { score: 72, issues: [] }
        }
      }
    }
  };
  
  await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(testEvent)));
  console.log(`✅ Event published for planId: ${planId}\n`);
  
  // Test 4: Wait and check if tip was created
  console.log('[4/5] Waiting 3 seconds for event processing...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const tipRes = await fetch(`http://localhost:4103/v1/plans/${planId}/coach-tip`);
  if (tipRes.status === 200) {
    const tip = await tipRes.json();
    console.log(`✅ CoachTip generated successfully!`);
    console.log(`   - Tip ID: ${tip.id}`);
    console.log(`   - Type: ${tip.type}`);
    console.log(`   - Priority: ${tip.priority}`);
    console.log(`   - Message: ${tip.message.substring(0, 80)}...\n`);
  } else {
    const error = await tipRes.json();
    console.log(`⚠️  Tip not found: ${error.message}\n`);
  }
  
  // Test 5: Check stats
  console.log('[5/5] Checking CoachTip statistics...');
  const statsRes = await fetch('http://localhost:4103/v1/coach-tips/stats');
  const stats = await statsRes.json();
  console.log(`   - Total Tips: ${stats.totalTips}`);
  console.log(`   - Active Tips: ${stats.activeTips}`);
  console.log(`   - Expired Tips: ${stats.expiredTips}\n`);
  
  await nc.close();
  
  console.log('🎉 Smoke test complete!\n');
  console.log(`📋 Next: Test via gateway with JWT auth:`);
  console.log(`   GET http://localhost:PORT/v1/plans/${planId}/coach-tip`);
}

smokeTest().catch(err => {
  console.error('❌ Smoke test failed:', err);
  process.exit(1);
});
