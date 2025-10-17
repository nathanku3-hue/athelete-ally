const { connect } = require('nats');

async function checkNATSState() {
  try {
    console.log('Connecting to NATS...');
    const nc = await connect({ servers: 'nats://localhost:4223' });
    const jsm = await nc.jetstreamManager();
    
    console.log('Getting stream info...');
    try {
      const streamInfo = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
      console.log('Stream info:', JSON.stringify({
        name: streamInfo.config.name,
        subjects: streamInfo.config.subjects,
        messages: streamInfo.state.messages,
        bytes: streamInfo.state.bytes,
        first_seq: streamInfo.state.first_seq,
        last_seq: streamInfo.state.last_seq,
      }, null, 2));
      
      console.log('\nConsumers:');
      const consumers = await jsm.consumers.list('ATHLETE_ALLY_EVENTS').next();
      for (const consumer of consumers) {
        console.log(`- ${consumer.name} (durable: ${consumer.config.durable_name})`);
        console.log(`  Delivered: ${consumer.delivered.stream_seq}`);
        console.log(`  Ack Pending: ${consumer.ack_floor.stream_seq}`);
        console.log(`  Num Pending: ${consumer.num_pending}`);
      }
      
    } catch (err) {
      console.error('Error getting stream info:', err.message);
    }
    
    await nc.close();
    console.log('\nDone');
    
  } catch (error) {
    console.error('Failed:', error);
  }
}

checkNATSState();