const { connect } = require('nats');

async function deleteConsumer() {
  try {
    console.log('Connecting to NATS...');
    const nc = await connect({ servers: 'nats://localhost:4223' });
    const jsm = await nc.jetstreamManager();
    
    console.log('Deleting consumer coach-tip-plan-gen-consumer...');
    await jsm.consumers.delete('ATHLETE_ALLY_EVENTS', 'coach-tip-plan-gen-consumer');
    console.log('Consumer deleted successfully');
    
    await nc.close();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deleteConsumer();