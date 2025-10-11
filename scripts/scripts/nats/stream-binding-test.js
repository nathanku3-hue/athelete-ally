#!/usr/bin/env node

/**
 * Stream Binding Diagnostic Script
 * Tests the fallback binding logic for normalize-service
 * 
 * Usage:
 *   EVENT_STREAM_MODE=single node scripts/nats/stream-binding-test.js
 *   EVENT_STREAM_MODE=multi node scripts/nats/stream-binding-test.js
 */

const { connect, consumerOpts } = require('nats');

// Import the new stream candidates function
async function getStreamCandidates() {
  const { getStreamCandidates } = await import('../../packages/event-bus/dist/index.js');
  return getStreamCandidates();
}

async function testStreamBinding() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
  const eventStreamMode = process.env.EVENT_STREAM_MODE || 'single';
  const streamCandidates = await getStreamCandidates();
  const hrvDurable = process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-durable';
  const filterSubject = 'athlete-ally.hrv.raw-received';
  
  console.log(`🔍 Testing stream binding for mode: ${eventStreamMode}`);
  console.log(`📊 Stream candidates: ${streamCandidates.join(', ')}`);
  console.log(`🔗 NATS URL: ${natsUrl}`);

  let nc;
  try {
    nc = await connect({ servers: natsUrl });
    console.log('✅ Connected to NATS');

    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    let actualStreamName = '';
    let consumerCreated = false;

    // Test the same logic as normalize-service
    for (const streamName of streamCandidates) {
      try {
        await jsm.consumers.add(streamName, {
          durable_name: hrvDurable,
          filter_subject: filterSubject,
          ack_policy: 'explicit',
          deliver_policy: 'all',
          max_deliver: 5,
          ack_wait: 60000 * 1_000_000, // 60s in ns
          max_ack_pending: 1000
        });
        console.log(`✅ HRV consumer created on ${streamName}: ${hrvDurable}`);
        actualStreamName = streamName;
        consumerCreated = true;
        break;
      } catch (e) {
        console.log(`⚠️  Attempted to create HRV consumer on ${streamName}: ${hrvDurable}. Error: ${e.message}. Trying next candidate.`);
      }
    }

    if (!actualStreamName) {
      throw new Error('Failed to create or bind HRV consumer to any available stream.');
    }

    // Test binding
    const opts = consumerOpts();
    opts.bind(actualStreamName, hrvDurable);
    opts.ackExplicit();
    opts.manualAck();
    opts.maxDeliver(5);
    opts.ackWait(60000);

    const sub = await js.pullSubscribe(filterSubject, opts);
    console.log(`✅ HRV durable pull consumer bound: ${hrvDurable}, subject: ${filterSubject}, stream: ${actualStreamName}`);

    // Test consumer info
    try {
      const consumerInfo = await jsm.consumers.info(actualStreamName, hrvDurable);
      console.log(`📊 Consumer info:`, {
        stream: consumerInfo.stream_name,
        durable: consumerInfo.name,
        filterSubject: consumerInfo.config.filter_subject,
        ackPolicy: consumerInfo.config.ack_policy,
        deliverPolicy: consumerInfo.config.deliver_policy,
        maxDeliver: consumerInfo.config.max_deliver,
        ackWait: consumerInfo.config.ack_wait,
        maxAckPending: consumerInfo.config.max_ack_pending,
        numPending: consumerInfo.num_pending,
        numAckPending: consumerInfo.num_ack_pending
      });
    } catch (infoError) {
      console.log(`⚠️  Could not get consumer info: ${infoError.message}`);
    }

    console.log(`🎯 Test Results:`);
    console.log(`   - Mode: ${eventStreamMode}`);
    console.log(`   - Bound Stream: ${actualStreamName}`);
    console.log(`   - Consumer Created: ${consumerCreated}`);
    console.log(`   - Expected Stream: ${eventStreamMode === 'multi' ? 'AA_CORE_HOT' : 'ATHLETE_ALLY_EVENTS'}`);
    console.log(`   - Test: ${actualStreamName === (eventStreamMode === 'multi' ? 'AA_CORE_HOT' : 'ATHLETE_ALLY_EVENTS') ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error('❌ Error in stream binding test:', error.message);
    process.exit(1);
  } finally {
    if (nc) {
      await nc.close();
      console.log('✅ Connection closed');
    }
  }
  console.log('✅ Stream binding test completed');
}

testStreamBinding();

