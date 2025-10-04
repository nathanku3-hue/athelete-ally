#!/usr/bin/env node

/**
 * Simple Stream Creation Script
 * Creates the necessary streams for testing
 */

const { connect } = require('nats');

async function createStreams() {
  const natsUrl = 'nats://localhost:4223';
  console.log(`🔍 Connecting to NATS at: ${natsUrl}`);
  
  try {
    const nc = await connect({ servers: natsUrl });
    const jsm = await nc.jetstreamManager();
    
    console.log('✅ Connected to NATS JetStream');
    
    // Create ATHLETE_ALLY_EVENTS stream (legacy single-stream)
    try {
      await jsm.streams.add({
        name: 'ATHLETE_ALLY_EVENTS',
        subjects: ['athlete-ally.>', 'vendor.>', 'sleep.*'],
        max_age: 24 * 60 * 60 * 1_000_000_000, // 24h in nanoseconds
        storage: 'file',
        discard: 'old',
        duplicate_window: 2 * 60 * 1_000_000_000, // 2min in nanoseconds
        compression: true
      });
      console.log('✅ Created ATHLETE_ALLY_EVENTS stream');
    } catch (e) {
      if (e.message.includes('stream name already in use')) {
        console.log('ℹ️  ATHLETE_ALLY_EVENTS stream already exists');
      } else {
        throw e;
      }
    }
    
    // Create AA_CORE_HOT stream (multi-stream mode)
    try {
      await jsm.streams.add({
        name: 'AA_CORE_HOT',
        subjects: ['athlete-ally.>', 'sleep.*'],
        max_age: 48 * 60 * 60 * 1_000_000_000, // 48h in nanoseconds
        storage: 'file',
        discard: 'old',
        duplicate_window: 2 * 60 * 1_000_000_000, // 2min in nanoseconds
        compression: true
      });
      console.log('✅ Created AA_CORE_HOT stream');
    } catch (e) {
      if (e.message.includes('stream name already in use')) {
        console.log('ℹ️  AA_CORE_HOT stream already exists');
      } else {
        throw e;
      }
    }
    
    // Create AA_VENDOR_HOT stream (multi-stream mode)
    try {
      await jsm.streams.add({
        name: 'AA_VENDOR_HOT',
        subjects: ['vendor.>'],
        max_age: 48 * 60 * 60 * 1_000_000_000, // 48h in nanoseconds
        storage: 'file',
        discard: 'old',
        duplicate_window: 2 * 60 * 1_000_000_000, // 2min in nanoseconds
        compression: true
      });
      console.log('✅ Created AA_VENDOR_HOT stream');
    } catch (e) {
      if (e.message.includes('stream name already in use')) {
        console.log('ℹ️  AA_VENDOR_HOT stream already exists');
      } else {
        throw e;
      }
    }
    
    // Create AA_DLQ stream (dead letter queue)
    try {
      await jsm.streams.add({
        name: 'AA_DLQ',
        subjects: ['dlq.>'],
        max_age: 14 * 24 * 60 * 60 * 1_000_000_000, // 14d in nanoseconds
        storage: 'file',
        discard: 'old',
        duplicate_window: 2 * 60 * 1_000_000_000, // 2min in nanoseconds
        compression: true
      });
      console.log('✅ Created AA_DLQ stream');
    } catch (e) {
      if (e.message.includes('stream name already in use')) {
        console.log('ℹ️  AA_DLQ stream already exists');
      } else {
        throw e;
      }
    }
    
    await nc.close();
    console.log('✅ Streams created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createStreams();
