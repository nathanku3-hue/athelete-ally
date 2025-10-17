const { connect } = require('nats');
const { randomUUID } = require('crypto');

async function testCoachTip() {
  try {
    console.log('Connecting to NATS...');
    const nc = await connect({ servers: 'nats://localhost:4223' });
    const js = nc.jetstream();
    
    console.log('Publishing test plan_generated event...');
    const testEvent = {
      eventId: randomUUID(),
      planId: randomUUID(),
      userId: randomUUID(),
      timestamp: Date.now(),
      planName: 'Test Training Plan',
      status: 'completed',
      version: 1,
      planData: {
        scoring: {
          total: 75,
          factors: {
            safety: {
              score: 80,
              reasons: ['Good form techniques', 'Appropriate load progression']
            },
            compliance: {
              score: 70,
              reasons: ['Realistic schedule', 'Achievable goals']
            },
            performance: {
              score: 75,
              reasons: ['Well-structured periodization', 'Progressive overload']
            }
          }
        }
      }
    };
    
    await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(testEvent)));
    console.log(`Event published for plan: ${testEvent.planId}`);
    
    // Wait a bit for processing
    console.log('Waiting 3 seconds for event processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if tip was created by querying the CoachTip service
    console.log('Checking if tip was generated...');
    try {
      const response = await fetch(`http://localhost:4103/v1/plans/${testEvent.planId}/coach-tip`);
      if (response.ok) {
        const tip = await response.json();
        console.log('✅ SUCCESS! Coaching tip generated:');
        console.log(JSON.stringify(tip, null, 2));
      } else if (response.status === 404) {
        console.log('❌ No tip found for plan. Checking if any tips exist...');
        
        // Try checking subscriber status
        const subStatusResponse = await fetch('http://localhost:4103/subscriber/status');
        if (subStatusResponse.ok) {
          const subStatus = await subStatusResponse.json();
          console.log('Subscriber status:', JSON.stringify(subStatus, null, 2));
        }
        
        // Check service health
        const healthResponse = await fetch('http://localhost:4103/health');
        if (healthResponse.ok) {
          const health = await healthResponse.json();
          console.log('Service health:', JSON.stringify(health, null, 2));
        }
        
        // Try to check if any tips exist for the user
        try {
          const userTipsResponse = await fetch(`http://localhost:4103/v1/users/${testEvent.userId}/coach-tips`);
          if (userTipsResponse.ok) {
            const userTips = await userTipsResponse.json();
            console.log('Tips for user:', JSON.stringify(userTips, null, 2));
          } else {
            console.log('No tips found for user');
          }
        } catch (e) {
          console.log('Could not query user tips');
        }
      } else {
        console.log('❌ Error response:', response.status, await response.text());
      }
    } catch (fetchError) {
      console.error('❌ Failed to query CoachTip service:', fetchError.message);
    }
    
    await nc.close();
    console.log('Test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCoachTip();