#!/usr/bin/env node
const { connect } = require("nats");

async function verifyMigration(phase) {
  const url = process.env.NATS_URL || "nats://localhost:4223";
  const nc = await connect({ servers: url });
  const jsm = await nc.jetstreamManager();

  console.log(`\nPhase ${phase} Migration Verification\n${'='.repeat(60)}\n`);

  const checks = {
    0: [
      { stream: 'AA_DLQ', subjects: ['dlq.>'], consumer: null }
    ],
    1: [
      { stream: 'AA_VENDOR_HOT', subjects: ['vendor.>'], consumer: 'normalize-oura' },
      { stream: 'ATHLETE_ALLY_EVENTS', subjectsExclude: ['vendor.>'] }
    ],
    2: [
      { stream: 'AA_CORE_HOT', subjects: ['athlete-ally.>', 'sleep.*'], consumer: 'normalize-hrv-durable' },
      { stream: 'ATHLETE_ALLY_EVENTS', subjectsEmpty: true }
    ],
    3: [
      { stream: 'ATHLETE_ALLY_EVENTS', shouldNotExist: true }
    ]
  };

  let passed = 0;
  let failed = 0;

  for (const check of (checks[phase] || [])) {
    try {
      const info = await jsm.streams.info(check.stream);
      const cfg = info.config;

      // Check existence
      if (check.shouldNotExist) {
        console.log(`❌ ${check.stream} should not exist`);
        failed++;
        continue;
      }

      console.log(`✅ ${check.stream} exists`);

      // Check subjects
      if (check.subjects) {
        const hasAll = check.subjects.every(s => cfg.subjects.includes(s));
        if (hasAll) {
          console.log(`   ✅ Subjects: ${check.subjects.join(', ')}`);
          passed++;
        } else {
          console.log(`   ❌ Missing subjects: ${check.subjects.join(', ')}`);
          failed++;
        }
      }

      if (check.subjectsExclude) {
        const hasNone = check.subjectsExclude.every(s => !cfg.subjects.includes(s));
        if (hasNone) {
          console.log(`   ✅ No longer has: ${check.subjectsExclude.join(', ')}`);
          passed++;
        } else {
          console.log(`   ❌ Still has: ${check.subjectsExclude.join(', ')}`);
          failed++;
        }
      }

      if (check.subjectsEmpty) {
        if (cfg.subjects.length === 0) {
          console.log(`   ✅ Subjects empty`);
          passed++;
        } else {
          console.log(`   ❌ Subjects not empty: ${cfg.subjects.join(', ')}`);
          failed++;
        }
      }

      // Check consumer
      if (check.consumer) {
        try {
          await jsm.consumers.info(check.stream, check.consumer);
          console.log(`   ✅ Consumer: ${check.consumer}`);
          passed++;
        } catch {
          console.log(`   ❌ Consumer not found: ${check.consumer}`);
          failed++;
        }
      }

    } catch (e) {
      if (check.shouldNotExist) {
        console.log(`✅ ${check.stream} correctly does not exist`);
        passed++;
      } else {
        console.log(`❌ ${check.stream} not found`);
        failed++;
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? `✅ Phase ${phase} verification PASSED` : `❌ Phase ${phase} verification FAILED`);

  await nc.drain();
  process.exit(failed === 0 ? 0 : 1);
}

// CLI usage: node migration-verify.js <phase>
if (require.main === module) {
  const phase = parseInt(process.argv[2] || '0');
  verifyMigration(phase).catch(console.error);
}

module.exports = { verifyMigration };
