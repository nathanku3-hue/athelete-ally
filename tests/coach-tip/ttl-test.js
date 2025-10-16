const { connect } = require('nats');
const { randomUUID } = require('crypto');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const NATS_URL = 'nats://localhost:4223';
const API_URL = 'http://localhost:4103';
const EXPECTED_TTL_DAYS = 7;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkRedisTTL(planId) {
  try {
    // Use docker exec to check TTL in Redis (key format: plan-tips:{planId})
    const { stdout } = await execPromise(`docker exec compose-redis-1 redis-cli TTL plan-tips:${planId}`);
    const ttl = parseInt(stdout.trim());
    return ttl;
  } catch (error) {
    console.error('Error checking Redis TTL:', error.message);
    return null;
  }
}

async function runTTLTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('⏰ COACH TIP TTL VERIFICATION TEST');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    console.log('📤 Publishing test event...');
    const nc = await connect({ servers: NATS_URL });
    const js = nc.jetstream();
    
    const planId = randomUUID();
    const event = {
      eventId: randomUUID(),
      planId,
      userId: randomUUID(),
      timestamp: Date.now(),
      planName: 'TTL Test Plan',
      status: 'completed',
      version: 1,
      planData: {
        scoring: {
          total: 55,
          factors: {
            safety: { score: 50, reasons: ['TTL test'] },
            compliance: { score: 55, reasons: ['TTL test'] },
            performance: { score: 60, reasons: ['TTL test'] }
          }
        }
      }
    };
    
    await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(event)));
    await nc.close();
    
    console.log('✅ Event published\n');
    console.log('⏳ Waiting 3 seconds for processing and storage...');
    await sleep(3000);
    
    // Check if tip was generated
    console.log('🔍 Checking if tip was generated...');
    const response = await fetch(`${API_URL}/v1/plans/${planId}/coach-tip`);
    
    if (!response.ok) {
      console.log('❌ Tip was not generated. Cannot verify TTL.');
      process.exit(1);
    }
    
    const tip = await response.json();
    console.log('✅ Tip generated:', tip.id);
    console.log(`   Type: ${tip.type}, Priority: ${tip.priority}\n`);
    
    // Check Redis TTL
    console.log('🔍 Checking Redis TTL...');
    const ttl = await checkRedisTTL(planId);
    
    if (ttl === null) {
      console.log('❌ Could not retrieve TTL from Redis');
      console.log('   Make sure Redis container is running: docker ps | grep redis');
      process.exit(1);
    }
    
    if (ttl === -1) {
      console.log('❌ No TTL set (key will never expire)');
      console.log('   Expected: 7 days TTL should be set\n');
      process.exit(1);
    }
    
    if (ttl === -2) {
      console.log('❌ Key does not exist in Redis');
      process.exit(1);
    }
    
    // Calculate expected TTL range (7 days = 604800 seconds)
    const expectedTTL = EXPECTED_TTL_DAYS * 24 * 60 * 60;
    const minTTL = expectedTTL - 10; // Allow 10 second tolerance for processing time
    const maxTTL = expectedTTL;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 TTL VERIFICATION RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`Key: plan-tips:${planId}`);
    console.log(`TTL: ${ttl} seconds (${(ttl / 86400).toFixed(2)} days)`);
    console.log(`Expected: ~${expectedTTL} seconds (${EXPECTED_TTL_DAYS} days)\n`);
    
    if (ttl >= minTTL && ttl <= maxTTL) {
      console.log('✅ PASSED: TTL is correctly set to 7 days');
      console.log(`   Within expected range: ${minTTL}-${maxTTL} seconds`);
      
      const hoursRemaining = (ttl / 3600).toFixed(1);
      const daysRemaining = (ttl / 86400).toFixed(2);
      console.log(`   Tip will expire in: ${hoursRemaining} hours (${daysRemaining} days)`);
    } else if (ttl < minTTL) {
      console.log('⚠️  WARNING: TTL is shorter than expected');
      console.log(`   Got ${ttl}s, expected ~${expectedTTL}s`);
      console.log('   Tip may expire too soon');
    } else {
      console.log('⚠️  WARNING: TTL is longer than expected');
      console.log(`   Got ${ttl}s, expected ~${expectedTTL}s`);
      console.log('   Tip may stay cached too long');
    }
    
    // Check expiration timestamp from API
    if (tip.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(tip.expiresAt);
      const msUntilExpiry = expiresAt - now;
      const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);
      
      console.log(`\n📅 API expiration timestamp:`);
      console.log(`   Expires at: ${tip.expiresAt}`);
      console.log(`   Days until expiry: ${daysUntilExpiry.toFixed(2)}`);
      
      if (Math.abs(daysUntilExpiry - EXPECTED_TTL_DAYS) < 0.01) {
        console.log('   ✅ Matches expected 7-day expiration');
      } else {
        console.log(`   ⚠️  Different from expected ${EXPECTED_TTL_DAYS} days`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTTLTest();
