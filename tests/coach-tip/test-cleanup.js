const { connect } = require('nats');
const Redis = require('ioredis');

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4223';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Cleanup Redis test data
 */
async function cleanupRedis() {
  console.log('🧹 Cleaning up Redis test data...');

  try {
    const redis = new Redis(REDIS_URL);

    // Count keys before cleanup
    const coachTipKeys = await redis.keys('coach-tip:*');
    const planTipsKeys = await redis.keys('plan-tips:*');
    const totalKeys = coachTipKeys.length + planTipsKeys.length;

    if (totalKeys > 0) {
      console.log(`   Found ${totalKeys} coach-tip keys to clean`);

      // Delete all coach-tip related keys
      if (coachTipKeys.length > 0) {
        await redis.del(...coachTipKeys);
      }
      if (planTipsKeys.length > 0) {
        await redis.del(...planTipsKeys);
      }

      console.log(`   ✅ Deleted ${totalKeys} keys from Redis`);
    } else {
      console.log('   ✅ No coach-tip keys found (already clean)');
    }

    await redis.quit();
    return { success: true, keysDeleted: totalKeys };

  } catch (error) {
    console.error('   ❌ Redis cleanup failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Cleanup NATS JetStream consumer
 */
async function cleanupNATSConsumer() {
  console.log('🧹 Cleaning up NATS consumer...');

  try {
    const nc = await connect({ servers: NATS_URL });
    const jsm = await nc.jetstreamManager();

    const streamName = 'ATHLETE_ALLY_EVENTS';
    const consumerName = 'coach-tip-plan-gen-consumer';

    try {
      // Get consumer info
      const consumerInfo = await jsm.consumers.info(streamName, consumerName);
      const pending = consumerInfo.num_pending;
      const ackPending = consumerInfo.num_ack_pending;

      console.log(`   Consumer status: ${pending} pending, ${ackPending} ack pending`);

      // Delete and recreate consumer to reset state
      await jsm.consumers.delete(streamName, consumerName);
      console.log(`   ✅ Deleted consumer: ${consumerName}`);

      // Recreate consumer with same configuration
      await jsm.consumers.add(streamName, {
        durable_name: consumerName,
        ack_policy: 'explicit',
        filter_subject: 'athlete-ally.plans.generated',
        deliver_policy: 'all',
        max_deliver: 5,
        ack_wait: 30_000_000_000, // 30 seconds in nanoseconds
        max_ack_pending: 100
      });

      console.log(`   ✅ Recreated consumer: ${consumerName}`);

    } catch (error) {
      if (error.message.includes('not found')) {
        console.log(`   ℹ️  Consumer ${consumerName} does not exist (will be created on service start)`);
      } else {
        throw error;
      }
    }

    await nc.close();
    return { success: true };

  } catch (error) {
    console.error('   ❌ NATS consumer cleanup failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Optional: Purge all messages from the stream (use with caution!)
 */
async function purgeStreamMessages(streamName = 'ATHLETE_ALLY_EVENTS', subject = 'athlete-ally.plans.generated') {
  console.log(`🧹 Purging messages from stream ${streamName} (subject: ${subject})...`);

  try {
    const nc = await connect({ servers: NATS_URL });
    const jsm = await nc.jetstreamManager();

    // Get stream info before purge
    const streamInfo = await jsm.streams.info(streamName);
    const messagesBefore = streamInfo.state.messages;

    console.log(`   Stream has ${messagesBefore} total messages`);

    if (messagesBefore > 0) {
      // Purge messages for specific subject
      await jsm.streams.purge(streamName, { filter: subject });

      // Get stream info after purge
      const streamInfoAfter = await jsm.streams.info(streamName);
      const messagesAfter = streamInfoAfter.state.messages;
      const purged = messagesBefore - messagesAfter;

      console.log(`   ✅ Purged ${purged} messages (${messagesAfter} remaining in stream)`);
    } else {
      console.log('   ✅ Stream is empty (no messages to purge)');
    }

    await nc.close();
    return { success: true, messagesPurged: messagesBefore };

  } catch (error) {
    console.error('   ❌ Stream purge failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Full cleanup: Redis + NATS consumer
 */
async function fullCleanup(options = {}) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧹 COACH TIP TEST CLEANUP');
  console.log('═══════════════════════════════════════════════════════\n');

  const results = {
    timestamp: new Date().toISOString(),
    redis: {},
    natsConsumer: {},
    streamPurge: null
  };

  try {
    // Cleanup Redis
    results.redis = await cleanupRedis();

    // Cleanup NATS consumer
    results.natsConsumer = await cleanupNATSConsumer();

    // Optional: Purge stream messages
    if (options.purgeStream) {
      results.streamPurge = await purgeStreamMessages();
    }

    console.log('\n═══════════════════════════════════════════════════════');

    const allSuccess = results.redis.success && results.natsConsumer.success &&
                      (!options.purgeStream || results.streamPurge.success);

    if (allSuccess) {
      console.log('✅ CLEANUP COMPLETE - All operations successful');
    } else {
      console.log('⚠️  CLEANUP PARTIAL - Some operations failed');
    }

    console.log('═══════════════════════════════════════════════════════\n');

    // Output JSON for CI parsing
    if (process.env.OUTPUT_JSON) {
      console.log('<!-- CLEANUP_RESULTS_JSON');
      console.log(JSON.stringify(results, null, 2));
      console.log('-->');
    }

    process.exit(allSuccess ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Cleanup failed with unexpected error:', error);
    results.error = error.message;

    if (process.env.OUTPUT_JSON) {
      console.log('<!-- CLEANUP_RESULTS_JSON');
      console.log(JSON.stringify(results, null, 2));
      console.log('-->');
    }

    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {
  purgeStream: args.includes('--purge-stream') || args.includes('-p')
};

if (require.main === module) {
  fullCleanup(options);
}

module.exports = {
  cleanupRedis,
  cleanupNATSConsumer,
  purgeStreamMessages,
  fullCleanup
};
