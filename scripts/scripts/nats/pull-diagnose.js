/**
 * Pull Diagnose Script
 * Binds to JetStream consumer and processes a batch of messages for diagnostics
 * 
 * Usage:
 *   NATS_URL=nats://localhost:4223 NATS_CONSUMER_NAME=normalize-hrv-durable node scripts/nats/pull-diagnose.js
 */

const { connect, consumerOpts, StringCodec } = require('nats');

async function pullDiagnose() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
  const streamName = process.env.NATS_STREAM_NAME || 'AA_CORE_HOT'; // Try AA_CORE_HOT first
  const fallbackStreamName = 'ATHLETE_ALLY_EVENTS';
  const consumerName = process.env.NATS_CONSUMER_NAME || 'normalize-hrv-durable';
  const batchSize = parseInt(process.env.BATCH_SIZE || '3');
  const expiresMs = parseInt(process.env.EXPIRES_MS || '5000');
  
  console.log(`🔍 Pull diagnose at: ${natsUrl}`);
  console.log(`📊 Primary Stream: ${streamName}, Fallback: ${fallbackStreamName}, Consumer: ${consumerName}, Batch: ${batchSize}, Expires: ${expiresMs}ms`);
  
  const sc = StringCodec();
  
  try {
    const nc = await connect({ servers: natsUrl });
    const js = nc.jetstream();
    
    console.log('✅ Connected to NATS');
    
    // Bind to existing durable consumer - try primary stream first
    const opts = consumerOpts();
    opts.bind(streamName, consumerName);
    opts.ackExplicit();
    opts.manualAck();
    
    let sub;
    let actualStreamName = streamName;
    const filterSubject = 'athlete-ally.hrv.raw-received'; // Use the correct subject
    try {
      // Use the filter subject when binding
      sub = await js.pullSubscribe(filterSubject, opts);
      console.log(`✅ Bound to existing durable consumer on ${streamName}`);
    } catch (bindError) {
      console.log(`⚠️  ${streamName} not available, trying fallback ${fallbackStreamName}`);
      opts.bind(fallbackStreamName, consumerName);
      sub = await js.pullSubscribe(filterSubject, opts);
      actualStreamName = fallbackStreamName;
      console.log(`✅ Bound to existing durable consumer on ${fallbackStreamName}`);
    }
    
    // Try both patterns to see which works
    console.log('🔄 Testing fetch pattern...');
    try {
      if (typeof sub.fetch === "function") {
        console.log('📝 Fetch API available, using Pattern A');
        const batch = await sub.fetch({ max: batchSize, expires: expiresMs });
        let count = 0;
        for await (const m of batch) {
          count++;
          console.log(`📨 Message ${count}:`, {
            seq: m.info?.streamSequence,
            subject: m.subject,
            deliveryCount: m.info?.deliveryCount,
            stream: m.info?.stream,
            data: sc.decode(m.data).substring(0, 100) + '...'
          });
          
          // Parse and validate
          try {
            const eventData = JSON.parse(sc.decode(m.data));
            console.log(`✅ Parsed:`, {
              eventId: eventData.eventId,
              hasPayload: !!eventData.payload,
              payloadKeys: eventData.payload ? Object.keys(eventData.payload) : [],
              userId: eventData.payload?.userId ? 'present' : 'missing' // Avoid PII in logs
            });
            m.ack();
            console.log(`✅ Message ${count} acknowledged`);
          } catch (parseError) {
            console.error(`❌ Parse error on message ${count}:`, parseError.message);
            m.term();
          }
        }
        console.log(`📊 Pattern A processed ${count} messages from ${actualStreamName}`);
      } else {
        console.log('📝 Fetch API not available, using Pattern B');
        await sub.pull({ batch: batchSize, expires: expiresMs });
        
        let processed = 0;
        const deadline = Date.now() + expiresMs + 100;
        for await (const m of sub) {
          processed++;
          console.log(`📨 Message ${processed}:`, {
            seq: m.info?.streamSequence,
            subject: m.subject,
            deliveryCount: m.info?.deliveryCount,
            stream: m.info?.stream,
            data: sc.decode(m.data).substring(0, 100) + '...'
          });
          
          // Parse and validate
          try {
            const eventData = JSON.parse(sc.decode(m.data));
            console.log(`✅ Parsed:`, {
              eventId: eventData.eventId,
              hasPayload: !!eventData.payload,
              payloadKeys: eventData.payload ? Object.keys(eventData.payload) : [],
              userId: eventData.payload?.userId ? 'present' : 'missing' // Avoid PII in logs
            });
            m.ack();
            console.log(`✅ Message ${processed} acknowledged`);
          } catch (parseError) {
            console.error(`❌ Parse error on message ${processed}:`, parseError.message);
            m.term();
          }
          
          if (processed >= batchSize || Date.now() >= deadline) break;
        }
        console.log(`📊 Pattern B processed ${processed} messages from ${actualStreamName}`);
      }
    } catch (patternError) {
      console.error(`❌ Pattern test failed:`, patternError.message);
    }
    
    await nc.close();
    console.log('✅ Pull diagnose completed');
    
  } catch (error) {
    console.error('❌ Error in pull diagnose:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  pullDiagnose().catch(console.error);
}

module.exports = { pullDiagnose };