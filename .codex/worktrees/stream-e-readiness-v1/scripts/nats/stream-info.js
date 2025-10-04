#!/usr/bin/env node

/**
 * NATS JetStream Stream Information Diagnostic Tool
 * 
 * This script provides read-only inspection of NATS JetStream streams and consumers.
 * It's useful for debugging stream configurations and consumer states.
 * 
 * Usage:
 *   node scripts/nats/stream-info.js [nats-url]
 * 
 * Environment Variables:
 *   NATS_URL - NATS server URL (default: nats://localhost:4223)
 */

const { connect } = require('nats');

async function main() {
  const natsUrl = process.argv[2] || process.env.NATS_URL || 'nats://localhost:4223';
  
  console.log(`🔍 Connecting to NATS at: ${natsUrl}`);
  
  try {
    const nc = await connect({ servers: natsUrl });
    const jsm = await nc.jetstreamManager();
    
    console.log('✅ Connected to NATS JetStream');
    
    // List all streams
    const streamsResponse = await jsm.streams.list();
    
    if (!streamsResponse.streams || streamsResponse.streams.length === 0) {
      console.log('📭 No streams found');
      return;
    }
    
    console.log(`\n📊 Found ${streamsResponse.streams.length} stream(s):`);
    console.log('=' .repeat(80));
    
    for (const streamInfo of streamsResponse.streams) {
      console.log(`\n🏷️  Stream: ${streamInfo.config.name}`);
      console.log(`   Subjects: ${streamInfo.config.subjects.join(', ')}`);
      console.log(`   Storage: ${streamInfo.config.storage}`);
      console.log(`   Replicas: ${streamInfo.config.num_replicas}`);
      console.log(`   Max Age: ${streamInfo.config.max_age ? `${streamInfo.config.max_age / 1_000_000_000}s` : 'unlimited'}`);
      console.log(`   Discard Policy: ${streamInfo.config.discard}`);
      console.log(`   State: ${streamInfo.state.messages} messages, ${streamInfo.state.bytes} bytes`);
      
      // List consumers for this stream
      try {
        const consumersResponse = await jsm.consumers.list(streamInfo.config.name);
        
        if (consumersResponse.consumers && consumersResponse.consumers.length > 0) {
          console.log(`   👥 Consumers (${consumersResponse.consumers.length}):`);
          
          for (const consumerInfo of consumersResponse.consumers) {
            console.log(`      • ${consumerInfo.name}`);
            console.log(`        Type: ${consumerInfo.config.deliver_policy || 'all'}`);
            console.log(`        Durable: ${consumerInfo.config.durable_name || 'ephemeral'}`);
            console.log(`        Ack Policy: ${consumerInfo.config.ack_policy || 'explicit'}`);
            
            if (consumerInfo.num_pending > 0) {
              console.log(`        ⚠️  Pending: ${consumerInfo.num_pending} messages`);
            }
            
            if (consumerInfo.delivered && consumerInfo.delivered.consumer_seq) {
              console.log(`        📈 Delivered: ${consumerInfo.delivered.consumer_seq} messages`);
            }
          }
        } else {
          console.log(`   👥 No consumers found`);
        }
      } catch (err) {
        console.log(`   ❌ Error listing consumers: ${err.message}`);
      }
    }
    
    // Stream mode analysis
    console.log('\n🔧 Stream Mode Analysis:');
    console.log('=' .repeat(80));
    
    const hasCoreStream = streamsResponse.streams.some(s => s.config.name === 'AA_CORE_HOT');
    const hasLegacyStream = streamsResponse.streams.some(s => s.config.name === 'ATHLETE_ALLY_EVENTS');
    const hasVendorStream = streamsResponse.streams.some(s => s.config.name === 'AA_VENDOR_HOT');
    
    if (hasCoreStream && hasVendorStream) {
      console.log('📊 Mode: Multi-stream topology (AA_CORE_HOT + AA_VENDOR_HOT)');
    } else if (hasLegacyStream && !hasCoreStream) {
      console.log('📊 Mode: Single-stream topology (ATHLETE_ALLY_EVENTS)');
    } else {
      console.log('📊 Mode: Custom/Unknown topology');
    }
    
    console.log(`   AA_CORE_HOT: ${hasCoreStream ? '✅' : '❌'}`);
    console.log(`   AA_VENDOR_HOT: ${hasVendorStream ? '✅' : '❌'}`);
    console.log(`   ATHLETE_ALLY_EVENTS: ${hasLegacyStream ? '✅' : '❌'}`);
    
    await nc.close();
    console.log('\n✅ Disconnected from NATS');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };