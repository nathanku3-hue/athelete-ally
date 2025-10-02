#!/usr/bin/env node
/**
 * create-consumers.js - Idempotent JetStream consumer creation
 *
 * Creates durable consumers for normalize-service on AA_CORE_HOT stream.
 * Safe to run multiple times - updates consumers only if configuration differs.
 *
 * Environment Variables:
 *   NATS_URL          - NATS server URL (default: nats://localhost:4223)
 *   STREAM_NAME       - Target stream name (default: AA_CORE_HOT)
 *   DRY_RUN           - If 'true', only show what would be created (default: false)
 *
 * Usage:
 *   # Staging/Production
 *   NATS_URL=nats://staging-nats:4222 STREAM_NAME=AA_CORE_HOT node create-consumers.js
 *
 *   # Dry run
 *   DRY_RUN=true node create-consumers.js
 */

const { connect } = require('nats');

// Configuration from environment
const config = {
  natsUrl: process.env.NATS_URL || 'nats://localhost:4223',
  streamName: process.env.STREAM_NAME || 'AA_CORE_HOT',
  dryRun: process.env.DRY_RUN === 'true'
};

// Consumer configurations
const CONSUMERS = [
  {
    streamName: config.streamName,
    durable_name: 'normalize-hrv-durable',
    filter_subject: 'athlete-ally.hrv.raw-received',
    ack_policy: 'explicit',
    deliver_policy: 'all',
    max_deliver: 5,
    ack_wait: 60 * 1_000_000_000, // 60 seconds in nanoseconds
    max_ack_pending: 1000,
    description: 'HRV normalization consumer - processes raw HRV events'
  }
];

/**
 * Check if consumer needs update
 */
function consumerNeedsUpdate(existing, desired) {
  const ex = existing.config;

  const filterChanged = (ex.filter_subject || '') !== desired.filter_subject;
  const ackPolicyChanged = (ex.ack_policy || '') !== desired.ack_policy;
  const deliverPolicyChanged = (ex.deliver_policy || '') !== desired.deliver_policy;
  const maxDeliverChanged = Number(ex.max_deliver || 0) !== desired.max_deliver;
  const ackWaitChanged = Number(ex.ack_wait || 0) !== desired.ack_wait;
  const maxAckPendingChanged = Number(ex.max_ack_pending || 0) !== desired.max_ack_pending;

  return filterChanged || ackPolicyChanged || deliverPolicyChanged ||
         maxDeliverChanged || ackWaitChanged || maxAckPendingChanged;
}

/**
 * Ensure consumer exists with desired configuration
 */
async function ensureConsumer(jsm, consumerConfig) {
  const { streamName, description, ...desired } = consumerConfig;

  try {
    const info = await jsm.consumers.info(streamName, desired.durable_name);

    if (consumerNeedsUpdate(info, desired)) {
      console.log(`⚠️  Consumer ${desired.durable_name} exists but config differs`);
      console.log(`   Current: filter=${info.config.filter_subject}, ack_wait=${info.config.ack_wait}ns, max_deliver=${info.config.max_deliver}`);
      console.log(`   Desired: filter=${desired.filter_subject}, ack_wait=${desired.ack_wait}ns, max_deliver=${desired.max_deliver}`);

      if (config.dryRun) {
        console.log(`   [DRY-RUN] Would update consumer ${desired.durable_name}`);
      } else {
        // NATS consumers.add() acts as upsert - updates if exists
        await jsm.consumers.add(streamName, desired);
        console.log(`✅ Consumer ${desired.durable_name} updated successfully`);
      }
    } else {
      console.log(`✓  Consumer ${desired.durable_name} exists with correct config`);
    }
  } catch (err) {
    if (String(err.message || '').includes('consumer not found') ||
        String(err.message || '').includes('not found') ||
        err.code === '404') {
      console.log(`➕ Consumer ${desired.durable_name} does not exist`);
      console.log(`   Creating on stream: ${streamName}`);
      console.log(`   Filter subject: ${desired.filter_subject}`);
      console.log(`   Max deliver: ${desired.max_deliver}, Ack wait: ${desired.ack_wait / 1_000_000_000}s`);

      if (config.dryRun) {
        console.log(`   [DRY-RUN] Would create consumer ${desired.durable_name}`);
      } else {
        await jsm.consumers.add(streamName, desired);
        console.log(`✅ Consumer ${desired.durable_name} created successfully`);
      }
    } else {
      throw err;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('NATS JetStream - Consumer Creation (Idempotent)');
  console.log('='.repeat(60));
  console.log(`NATS URL:     ${config.natsUrl}`);
  console.log(`Stream:       ${config.streamName}`);
  console.log(`Dry Run:      ${config.dryRun ? 'YES (no changes will be made)' : 'NO'}`);
  console.log('='.repeat(60));
  console.log('');

  let nc;
  try {
    console.log(`Connecting to NATS at ${config.natsUrl}...`);
    nc = await connect({ servers: config.natsUrl });
    console.log('✅ Connected to NATS\n');

    const jsm = await nc.jetstreamManager();

    // Verify stream exists
    try {
      const streamInfo = await jsm.streams.info(config.streamName);
      console.log(`✓  Stream ${config.streamName} exists`);
      console.log(`   Subjects: ${streamInfo.config.subjects.join(', ')}`);
      console.log(`   Messages: ${streamInfo.state.messages}`);
      console.log('');
    } catch (err) {
      console.error(`❌ Stream ${config.streamName} not found. Please run create-streams.js first.`);
      process.exit(1);
    }

    // Ensure all consumers
    for (const consumerConfig of CONSUMERS) {
      console.log(`Processing consumer: ${consumerConfig.durable_name}`);
      console.log(`  Description: ${consumerConfig.description}`);
      await ensureConsumer(jsm, consumerConfig);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ All consumers processed successfully');
    console.log('='.repeat(60));

    // Summary
    console.log('\nConsumer Summary:');
    for (const consumerConfig of CONSUMERS) {
      try {
        const info = await jsm.consumers.info(config.streamName, consumerConfig.durable_name);
        console.log(`  ${consumerConfig.durable_name} (${config.streamName}):`);
        console.log(`    Filter Subject:    ${info.config.filter_subject}`);
        console.log(`    Ack Policy:        ${info.config.ack_policy}`);
        console.log(`    Max Deliver:       ${info.config.max_deliver}`);
        console.log(`    Ack Wait:          ${info.config.ack_wait / 1_000_000_000}s`);
        console.log(`    Pending Messages:  ${info.num_pending || 0}`);
        console.log(`    Delivered:         ${info.delivered?.stream_seq || 0}`);
        console.log(`    Ack Floor:         ${info.ack_floor?.stream_seq || 0}`);
      } catch (err) {
        console.log(`  ${consumerConfig.durable_name}: [Not yet created]`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.stack) console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    if (nc) {
      await nc.close();
      console.log('\n✅ NATS connection closed');
    }
  }
}

// Run main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
