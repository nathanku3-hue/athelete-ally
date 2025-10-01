#!/usr/bin/env node

/**
 * NATS JetStream Stream Information Checker
 * Prints subjects and configuration for ATHLETE_ALLY_EVENTS stream
 */

const { connect } = require('nats');

async function checkStreamInfo() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
  
  console.log(`🔍 Checking JetStream at: ${natsUrl}`);
  
  try {
    const nc = await connect({ servers: natsUrl });
    const jsm = await nc.jetstreamManager();
    
    console.log('✅ Connected to NATS');
    
    // Get stream info
    const streamName = 'ATHLETE_ALLY_EVENTS';
    const streamInfo = await jsm.streams.info(streamName);
    
    console.log(`\n📊 Stream: ${streamName}`);
    console.log(`   - Subjects: ${streamInfo.config.subjects.join(', ')}`);
    console.log(`   - Retention: ${streamInfo.config.retention}`);
    console.log(`   - Max Age: ${streamInfo.config.max_age}ns`);
    console.log(`   - Max Messages: ${streamInfo.config.max_msgs}`);
    console.log(`   - State: ${streamInfo.state.messages} messages, ${streamInfo.state.bytes} bytes`);
    
    // Check if required subjects are present
    const requiredSubjects = ['athlete-ally.>', 'vendor.oura.>', 'sleep.*'];
    const actualSubjects = streamInfo.config.subjects;
    
    console.log('\n🎯 Subject Validation:');
    for (const subject of requiredSubjects) {
      const found = actualSubjects.includes(subject);
      console.log(`   ${found ? '✅' : '❌'} ${subject}`);
    }
    
    const allFound = requiredSubjects.every(subject => actualSubjects.includes(subject));
    console.log(`\n${allFound ? '✅' : '❌'} All required subjects present: ${allFound}`);
    
    await nc.close();
    
  } catch (error) {
    console.error('❌ Error checking stream info:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  checkStreamInfo().catch(console.error);
}

module.exports = { checkStreamInfo };