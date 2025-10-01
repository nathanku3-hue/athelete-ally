#!/usr/bin/env node
const { connect } = require("nats");

async function printStreamInfo() {
  const url = process.env.NATS_URL || "nats://localhost:4223";
  const nc = await connect({ servers: url });
  const jsm = await nc.jetstreamManager();

  // Check all possible streams
  const streams = [
    "AA_CORE_HOT",
    "AA_VENDOR_HOT",
    "AA_DLQ",
    "ATHLETE_ALLY_EVENTS"  // Legacy
  ];

  console.log(`\nNATS JetStream @ ${url}\n${'='.repeat(60)}\n`);

  for (const name of streams) {
    try {
      const info = await jsm.streams.info(name);
      const cfg = info.config;
      const state = info.state;

      console.log(`[${name}]`);
      console.log(`  Subjects:     ${JSON.stringify(cfg.subjects || [])}`);
      console.log(`  Max Age:      ${(cfg.max_age / 1e9 / 3600).toFixed(1)}h`);
      console.log(`  Replicas:     ${cfg.num_replicas || 1}`);
      console.log(`  Storage:      ${cfg.storage}`);
      console.log(`  Messages:     ${state.messages}`);
      console.log(`  Bytes:        ${state.bytes}`);
      console.log(`  Consumers:    ${state.consumer_count}`);
      console.log();
    } catch (e) {
      console.log(`[${name}] Not found\n`);
    }
  }

  await nc.drain();
}

if (require.main === module) {
  printStreamInfo().catch(console.error);
}

module.exports = { printStreamInfo };
