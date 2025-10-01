#!/usr/bin/env node
/**
 * create-streams.js - Idempotent JetStream stream creation
 *
 * Creates AA_CORE_HOT, AA_VENDOR_HOT, and AA_DLQ streams with configurable parameters.
 * Safe to run multiple times - updates streams only if configuration differs.
 *
 * Environment Variables:
 *   NATS_URL          - NATS server URL (default: nats://localhost:4223)
 *   REPLICAS          - Number of stream replicas (default: 1 for staging, 3 for prod)
 *   NODE_ENV          - Environment name (development|staging|production)
 *   DRY_RUN           - If 'true', only show what would be created (default: false)
 *
 * Usage:
 *   # Staging (1 replica)
 *   NATS_URL=nats://staging-nats:4222 REPLICAS=1 node create-streams.js
 *
 *   # Production (3 replicas)
 *   NATS_URL=nats://prod-nats:4222 REPLICAS=3 node create-streams.js
 *
 *   # Dry run
 *   DRY_RUN=true node create-streams.js
 */

const { connect } = require('nats');

// Configuration from environment
const config = {
  natsUrl: process.env.NATS_URL || 'nats://localhost:4223',
  replicas: parseInt(process.env.REPLICAS || '1'),
  nodeEnv: process.env.NODE_ENV || 'development',
  dryRun: process.env.DRY_RUN === 'true'
};

// Stream configurations
const STREAMS = [
  {
    name: 'AA_CORE_HOT',
    subjects: ['athlete-ally.>', 'sleep.*'],
    maxAgeHours: 48,
    description: 'Core application events (HRV, sleep, onboarding, plan generation)'
  },
  {
    name: 'AA_VENDOR_HOT',
    subjects: ['vendor.>'],
    maxAgeHours: 48,
    description: 'Vendor webhook events (Oura, etc.)'
  },
  {
    name: 'AA_DLQ',
    subjects: ['dlq.>'],
    maxAgeHours: 14 * 24, // 14 days
    description: 'Dead letter queue for failed messages'
  }
];

/**
 * Convert hours to nanoseconds for NATS JetStream
 */
function hoursToNanos(hours) {
  return hours * 60 * 60 * 1_000_000_000;
}

/**
 * Compare two arrays ignoring order
 */
function sameSet(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const x of setA) {
    if (!setB.has(x)) return false;
  }
  return true;
}

/**
 * Check if stream needs update
 */
function streamNeedsUpdate(existing, desired) {
  const ex = existing.config;

  const subjectsChanged = !sameSet(ex.subjects || [], desired.subjects);
  const ageChanged = Number(ex.max_age || 0) !== desired.max_age;
  const replChanged = Number(ex.num_replicas || 1) !== desired.num_replicas;
  const storageChanged = (ex.storage || 'file') !== desired.storage;
  const discardChanged = (ex.discard || 'old') !== desired.discard;

  return subjectsChanged || ageChanged || replChanged || storageChanged || discardChanged;
}

/**
 * Ensure stream exists with desired configuration
 */
async function ensureStream(jsm, streamConfig) {
  const desired = {
    name: streamConfig.name,
    subjects: streamConfig.subjects,
    retention: 'limits',
    max_age: hoursToNanos(streamConfig.maxAgeHours),
    storage: 'file',
    discard: 'old',
    num_replicas: config.replicas,
    duplicate_window: hoursToNanos(2 / 60) // 2 minutes in nanos
  };

  try {
    const info = await jsm.streams.info(streamConfig.name);

    if (streamNeedsUpdate(info, desired)) {
      console.log(`⚠️  Stream ${streamConfig.name} exists but config differs`);
      console.log(`   Current: subjects=${info.config.subjects.join(',')}, replicas=${info.config.num_replicas}, maxAge=${info.config.max_age}ns`);
      console.log(`   Desired: subjects=${desired.subjects.join(',')}, replicas=${desired.num_replicas}, maxAge=${desired.max_age}ns`);

      if (config.dryRun) {
        console.log(`   [DRY-RUN] Would update stream ${streamConfig.name}`);
      } else {
        await jsm.streams.update(streamConfig.name, desired);
        console.log(`✅ Stream ${streamConfig.name} updated successfully`);
      }
    } else {
      console.log(`✓  Stream ${streamConfig.name} exists with correct config`);
    }
  } catch (err) {
    if (String(err.message || '').includes('stream not found') ||
        String(err.message || '').includes('not found')) {
      console.log(`➕ Stream ${streamConfig.name} does not exist`);
      console.log(`   Creating with: subjects=${desired.subjects.join(',')}, replicas=${desired.num_replicas}, maxAge=${streamConfig.maxAgeHours}h`);

      if (config.dryRun) {
        console.log(`   [DRY-RUN] Would create stream ${streamConfig.name}`);
      } else {
        await jsm.streams.add(desired);
        console.log(`✅ Stream ${streamConfig.name} created successfully`);
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
  console.log('NATS JetStream - Stream Creation (Idempotent)');
  console.log('='.repeat(60));
  console.log(`Environment:  ${config.nodeEnv}`);
  console.log(`NATS URL:     ${config.natsUrl}`);
  console.log(`Replicas:     ${config.replicas}`);
  console.log(`Dry Run:      ${config.dryRun ? 'YES (no changes will be made)' : 'NO'}`);
  console.log('='.repeat(60));
  console.log('');

  let nc;
  try {
    console.log(`Connecting to NATS at ${config.natsUrl}...`);
    nc = await connect({ servers: config.natsUrl });
    console.log('✅ Connected to NATS\n');

    const jsm = await nc.jetstreamManager();

    // Ensure all streams
    for (const streamConfig of STREAMS) {
      console.log(`Processing stream: ${streamConfig.name}`);
      console.log(`  Description: ${streamConfig.description}`);
      await ensureStream(jsm, streamConfig);
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ All streams processed successfully');
    console.log('='.repeat(60));

    // Summary
    console.log('\nStream Summary:');
    for (const streamConfig of STREAMS) {
      try {
        const info = await jsm.streams.info(streamConfig.name);
        console.log(`  ${streamConfig.name}:`);
        console.log(`    Subjects:  ${info.config.subjects.join(', ')}`);
        console.log(`    Messages:  ${info.state.messages}`);
        console.log(`    Bytes:     ${info.state.bytes}`);
        console.log(`    Replicas:  ${info.config.num_replicas}`);
        console.log(`    Max Age:   ${streamConfig.maxAgeHours}h`);
      } catch (err) {
        console.log(`  ${streamConfig.name}: [Not yet created]`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
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
