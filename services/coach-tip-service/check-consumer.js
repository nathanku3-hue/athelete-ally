import { connect } from 'nats';

async function checkConsumer() {
  const nc = await connect({ servers: 'nats://localhost:4223' });
  const jsm = await nc.jetstreamManager();
  
  // Get stream info
  const streamInfo = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
  console.log('Stream:', streamInfo.config.name);
  console.log('Messages:', streamInfo.state.messages);
  console.log('Consumers:', streamInfo.state.num_consumers);
  console.log('');
  
  // List consumers
  console.log('Consumers on stream:');
  const consumers = await jsm.consumers.list('ATHLETE_ALLY_EVENTS').next();
  for (const consumer of consumers) {
    console.log('  - Name:', consumer.name);
    console.log('    Durable:', consumer.config.durable_name);
    console.log('    Filter:', consumer.config.filter_subject);
    console.log('    Pending:', consumer.num_pending);
    console.log('    Delivered:', consumer.delivered.stream_seq);
    console.log('');
  }
  
  await nc.close();
}

checkConsumer().catch(console.error);
