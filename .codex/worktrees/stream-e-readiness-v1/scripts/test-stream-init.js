#!/usr/bin/env node

/**
 * Stream Initialization Test Script
 * Creates streams and runs the tests
 */

async function initStreamsAndTest() {
  console.log('🚀 Initializing streams and running tests...');
  
  try {
    // Initialize EventBus and create streams
    const { EventBus } = await import('../packages/event-bus/dist/index.js');
    const eventBus = new EventBus();
    await eventBus.connect('nats://localhost:4223', { manageStreams: true });
    
    console.log('✅ Streams initialized');
    
    // Now run the stream binding test
    console.log('\n🧪 Running Test 2 (multi-mode fallback)...');
    process.env.EVENT_STREAM_MODE = 'multi';
    require('./nats/stream-binding-test.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initStreamsAndTest();
