#!/usr/bin/env node

/**
 * NATS Stream Information Script
 * 
 * Read-only script to inspect NATS JetStream topology.
 * Safe to run in any environment - no modifications made.
 * 
 * Usage:
 *   node scripts/nats/stream-info.js
 *   NATS_URL=nats://localhost:4223 node scripts/nats/stream-info.js
 */

const { connect } = require('nats');

async function main() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
  
  console.log(`🔍 Connecting to NATS at: ${natsUrl}`);
  
  try {
    const nc = await connect({ servers: natsUrl });
    console.log('✅ Connected to NATS');
    
    const jsm = await nc.jetstreamManager();
    
    // List all streams
    console.log('\n📋 Available Streams:');
    const streamsResponse = await jsm.streams.list();
    const streams = streamsResponse.streams || [];
    if (streams.length === 0) {
      console.log('  No streams found');
    } else {
      for (const stream of streams) {
        console.log(`  - ${stream.config.name}`);
      }
    }
    
    // Get detailed info for each stream
    if (streams && streams.length > 0) {
      for (const stream of streams) {
        const streamName = stream.config.name;
        console.log(`\n📊 Stream: ${streamName}`);
        
        try {
          const info = await jsm.streams.info(streamName);
          console.log(`  Subjects: ${info.config.subjects.join(', ')}`);
          console.log(`  Storage: ${info.config.storage}`);
          console.log(`  Replicas: ${info.config.num_replicas}`);
          console.log(`  Messages: ${info.state.messages}`);
          console.log(`  Bytes: ${info.state.bytes}`);
          
          // List consumers
          const consumers = await jsm.consumers.list(streamName);
          if (consumers.length === 0) {
            console.log(`  Consumers: None`);
          } else {
            console.log(`  Consumers:`);
            for (const consumer of consumers) {
              console.log(`    - ${consumer.name} (durable: ${consumer.config.durable_name || 'ephemeral'})`);
              console.log(`      Subject: ${consumer.config.filter_subject || 'all'}`);
              console.log(`      Ack Policy: ${consumer.config.ack_policy}`);
              console.log(`      Deliver Policy: ${consumer.config.deliver_policy}`);
              console.log(`      Max Deliver: ${consumer.config.max_deliver}`);
              console.log(`      Ack Wait: ${consumer.config.ack_wait}ns`);
            }
          }
        } catch (err) {
          console.log(`  Error getting info: ${err.message}`);
        }
      }
    }
    
    // Check for specific streams we care about
    console.log('\n🎯 Stream Mode Analysis:');
    const hasLegacy = streams && streams.some(s => s.config.name === 'ATHLETE_ALLY_EVENTS');
    const hasCore = streams && streams.some(s => s.config.name === 'AA_CORE_HOT');
    const hasVendor = streams && streams.some(s => s.config.name === 'AA_VENDOR_HOT');
    const hasDlq = streams && streams.some(s => s.config.name === 'AA_DLQ');
    
    console.log(`  ATHLETE_ALLY_EVENTS: ${hasLegacy ? '✅' : '❌'}`);
    console.log(`  AA_CORE_HOT: ${hasCore ? '✅' : '❌'}`);
    console.log(`  AA_VENDOR_HOT: ${hasVendor ? '✅' : '❌'}`);
    console.log(`  AA_DLQ: ${hasDlq ? '✅' : '❌'}`);
    
    if (hasLegacy && !hasCore) {
      console.log('  Mode: Single (legacy)');
    } else if (hasCore && hasLegacy) {
      console.log('  Mode: Multi (modern)');
    } else {
      console.log('  Mode: Unknown (incomplete setup)');
    }
    
    await nc.close();
    console.log('\n✅ Disconnected from NATS');
    
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };