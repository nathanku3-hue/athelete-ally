#!/usr/bin/env node
/**
 * migrate-subjects.js - Handle subject migration from legacy to multi-stream
 *
 * Strategy:
 *   1. Update ATHLETE_ALLY_EVENTS to remove subjects that will move to new streams
 *   2. Create AA_CORE_HOT with athlete-ally.>, sleep.*
 *   3. Create AA_VENDOR_HOT with vendor.>
 *
 * Environment Variables:
 *   NATS_URL - NATS server URL (default: nats://localhost:4223)
 *   DRY_RUN  - If 'true', only show what would be done (default: false)
 *
 * Usage:
 *   NATS_URL=nats://localhost:4223 node migrate-subjects.js
 */

const { connect } = require('nats');

const config = {
  natsUrl: process.env.NATS_URL || 'nats://localhost:4223',
  dryRun: process.env.DRY_RUN === 'true'
};

const hoursToNanos = (hours) => hours * 60 * 60 * 1_000_000_000;

async function main() {
  console.log('============================================================');
  console.log('NATS JetStream - Subject Migration');
  console.log('============================================================');
  console.log(`NATS URL: ${config.natsUrl}`);
  console.log(`Dry Run:  ${config.dryRun ? 'YES (no changes)' : 'NO'}`);
  console.log('============================================================\n');

  let nc;
  try {
    console.log('Connecting to NATS...');
    nc = await connect({ servers: config.natsUrl });
    console.log('✅ Connected to NATS\n');

    const jsm = await nc.jetstreamManager();

    // Step 1: Check current state of ATHLETE_ALLY_EVENTS
    console.log('Step 1: Checking ATHLETE_ALLY_EVENTS stream...');
    const legacyInfo = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
    console.log(`  Current subjects: ${legacyInfo.config.subjects.join(', ')}`);
    console.log(`  Messages: ${legacyInfo.state.messages}`);
    console.log(`  Bytes: ${legacyInfo.state.bytes}\n`);

    // Step 2: Update ATHLETE_ALLY_EVENTS to use a fallback subject
    console.log('Step 2: Updating ATHLETE_ALLY_EVENTS to use fallback subject...');
    console.log('  Removing: athlete-ally.>, vendor.>, sleep.*');
    console.log('  Adding: legacy.>  (temporary fallback subject)');

    if (config.dryRun) {
      console.log('  [DRY-RUN] Would update ATHLETE_ALLY_EVENTS\n');
    } else {
      await jsm.streams.update('ATHLETE_ALLY_EVENTS', {
        name: 'ATHLETE_ALLY_EVENTS',
        subjects: ['legacy.>'],  // Temporary fallback subject
        retention: legacyInfo.config.retention,
        max_age: legacyInfo.config.max_age,
        storage: legacyInfo.config.storage,
        num_replicas: legacyInfo.config.num_replicas
      });
      console.log('  ✅ ATHLETE_ALLY_EVENTS updated\n');
    }

    // Step 3: Create AA_CORE_HOT with intended subjects
    console.log('Step 3: Creating AA_CORE_HOT stream...');
    console.log('  Subjects: athlete-ally.>, sleep.*');
    console.log('  Max Age: 48h, Replicas: 1, Storage: file');

    if (config.dryRun) {
      console.log('  [DRY-RUN] Would create AA_CORE_HOT\n');
    } else {
      try {
        await jsm.streams.add({
          name: 'AA_CORE_HOT',
          subjects: ['athlete-ally.>', 'sleep.*'],
          retention: 'limits',
          max_age: hoursToNanos(48),
          storage: 'file',
          discard: 'old',
          num_replicas: 1,
          duplicate_window: hoursToNanos(2 / 60)
        });
        console.log('  ✅ AA_CORE_HOT created\n');
      } catch (err) {
        if (err.message.includes('stream already exists')) {
          console.log('  ⚠️  AA_CORE_HOT already exists, skipping\n');
        } else {
          throw err;
        }
      }
    }

    // Step 4: Create AA_VENDOR_HOT with intended subjects
    console.log('Step 4: Creating AA_VENDOR_HOT stream...');
    console.log('  Subjects: vendor.>');
    console.log('  Max Age: 48h, Replicas: 1, Storage: file');

    if (config.dryRun) {
      console.log('  [DRY-RUN] Would create AA_VENDOR_HOT\n');
    } else {
      try {
        await jsm.streams.add({
          name: 'AA_VENDOR_HOT',
          subjects: ['vendor.>'],
          retention: 'limits',
          max_age: hoursToNanos(48),
          storage: 'file',
          discard: 'old',
          num_replicas: 1,
          duplicate_window: hoursToNanos(2 / 60)
        });
        console.log('  ✅ AA_VENDOR_HOT created\n');
      } catch (err) {
        if (err.message.includes('stream already exists')) {
          console.log('  ⚠️  AA_VENDOR_HOT already exists, skipping\n');
        } else {
          throw err;
        }
      }
    }

    // Step 5: Verify AA_DLQ exists
    console.log('Step 5: Verifying AA_DLQ stream...');
    try {
      const dlqInfo = await jsm.streams.info('AA_DLQ');
      console.log(`  ✅ AA_DLQ exists (subjects: ${dlqInfo.config.subjects.join(', ')})\n`);
    } catch (err) {
      console.log('  ⚠️  AA_DLQ not found - should be created separately\n');
    }

    // Summary
    console.log('============================================================');
    console.log('✅ Subject migration complete');
    console.log('============================================================\n');

    console.log('Stream Summary:');
    for (const streamName of ['ATHLETE_ALLY_EVENTS', 'AA_CORE_HOT', 'AA_VENDOR_HOT', 'AA_DLQ']) {
      try {
        const info = await jsm.streams.info(streamName);
        console.log(`  ${streamName}:`);
        console.log(`    Subjects:  ${info.config.subjects.join(', ')}`);
        console.log(`    Messages:  ${info.state.messages}`);
        console.log(`    Bytes:     ${info.state.bytes}`);
      } catch (err) {
        console.log(`  ${streamName}: [Not found]`);
      }
    }

    console.log('\nNext Steps:');
    console.log('  1. Run create-consumers.js to create consumers on AA_CORE_HOT');
    console.log('  2. Update service config: EVENT_STREAM_MODE=multi');
    console.log('  3. Restart services to bind to new streams');
    console.log('  4. Monitor for 48 hours');

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

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
