// Quick smoke test: Publish a plan_generated event to NATS
import { connect } from 'nats';
import { randomUUID } from 'crypto';

async function publishTestEvent() {
  const nc = await connect({ servers: 'nats://localhost:4223' });
  const js = nc.jetstream();
  
  const planId = randomUUID();
  const testEvent = {
    eventId: randomUUID(),
    userId: '550e8400-e29b-41d4-a716-446655440000',
    planId,
    timestamp: Date.now(),
    planName: 'Test Training Plan',
    status: 'completed',
    version: 1,
    planData: {
      scoring: {
        total: 68.5,
        factors: {
          safety: {
            score: 65,
            issues: ['High volume progression']
          },
          compliance: {
            score: 78,
            issues: []
          },
          performance: {
            score: 72,
            issues: []
          }
        }
      }
    }
  };
  
  console.log('Publishing test plan_generated event:', testEvent.planId);
  await js.publish('athlete-ally.plans.generated', new TextEncoder().encode(JSON.stringify(testEvent)));
  console.log('Event published successfully!');
  console.log('Test planId:', planId);
  
  await nc.close();
  return planId;
}

publishTestEvent()
  .then(planId => console.log('\nTo test via API: curl http://localhost:4103/v1/plans/' + planId + '/coach-tip'))
  .catch(console.error);
