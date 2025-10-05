#!/usr/bin/env node

/**
 * Multi-Mode Fallback Verification Script
 * Tests the fallback behavior without complex imports
 */

const { connect, consumerOpts } = require('nats');

// Replicate the getStreamCandidates logic directly
function getStreamCandidates() {
  const raw = String(process.env.EVENT_STREAM_MODE || 'single').toLowerCase().trim();
  const mode = raw === 'multi' ? 'multi' : 'single';
  
  if (mode === 'single') {
    return ['ATHLETE_ALLY_EVENTS']; // Legacy single-stream
  }
  
  // Multi mode: try AA_CORE_HOT first, fallback to ATHLETE_ALLY_EVENTS
  return ['AA_CORE_HOT', 'ATHLETE_ALLY_EVENTS'];
}

async function testMultiModeFallback() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
  const eventStreamMode = process.env.EVENT_STREAM_MODE || 'single';
  const streamCandidates = getStreamCandidates();
  const hrvDurable = process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-durable';
  const filterSubject = 'athlete-ally.hrv.raw-received';
  
  console.log(`🔍 Testing multi-mode fallback for mode: ${eventStreamMode}`);
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
    let fallbackOccurred = false;

    // Test the same logic as normalize-service
    for (const streamName of streamCandidates) {
      try {
        console.log(`🔄 Attempting to create consumer on ${streamName}...`);
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
        if (e.message.includes('consumer already exists')) {
          console.log(`✅ Consumer already exists on ${streamName}: ${hrvDurable}`);
          actualStreamName = streamName;
          consumerCreated = true;
          break;
        } else {
          console.log(`⚠️  ${streamName} not found: ${e.message}`);
          if (streamName === 'AA_CORE_HOT' && eventStreamMode === 'multi') {
            fallbackOccurred = true;
            console.log(`🔄 Fallback: AA_CORE_HOT not found → trying ATHLETE_ALLY_EVENTS`);
          }
        }
      }
    }

    if (!actualStreamName) {
      throw new Error('Failed to create or bind HRV consumer to any available stream.');
    }

    console.log(`\n🎯 Fallback Test Results:`);
    console.log(`   - Mode: ${eventStreamMode}`);
    console.log(`   - Bound Stream: ${actualStreamName}`);
    console.log(`   - Consumer Created: ${consumerCreated}`);
    console.log(`   - Fallback Occurred: ${fallbackOccurred}`);
    
    if (eventStreamMode === 'multi') {
      const expectedFallback = actualStreamName === 'ATHLETE_ALLY_EVENTS' && fallbackOccurred;
      console.log(`   - Expected Fallback: ${expectedFallback ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      const expectedSingle = actualStreamName === 'ATHLETE_ALLY_EVENTS';
      console.log(`   - Expected Single Mode: ${expectedSingle ? '✅ PASS' : '❌ FAIL'}`);
    }

  } catch (error) {
    console.error('❌ Error in fallback test:', error.message);
    process.exit(1);
  } finally {
    if (nc) {
      await nc.close();
      console.log('✅ Connection closed');
    }
  }
  console.log('✅ Multi-mode fallback test completed');
}

testMultiModeFallback();
