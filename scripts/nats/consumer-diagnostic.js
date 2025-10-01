#!/usr/bin/env node
const { connect } = require("nats");

async function diagnoseConsumer(stream, durable) {
  const url = process.env.NATS_URL || "nats://localhost:4223";
  const nc = await connect({ servers: url });
  const jsm = await nc.jetstreamManager();

  try {
    const info = await jsm.consumers.info(stream, durable);
    const cfg = info.config;
    const delivered = info.delivered;
    const ackFloor = info.ack_floor;

    console.log(`\nConsumer: ${stream}/${durable}\n${'='.repeat(60)}\n`);
    console.log(`Filter Subject:    ${cfg.filter_subject}`);
    console.log(`ACK Policy:        ${cfg.ack_policy}`);
    console.log(`ACK Wait:          ${(cfg.ack_wait / 1e9).toFixed(1)}s`);
    console.log(`Max Deliver:       ${cfg.max_deliver}`);
    console.log(`Deliver Policy:    ${cfg.deliver_policy}`);
    console.log();
    console.log(`Pending:           ${info.num_pending}`);
    console.log(`Ack Pending:       ${info.num_ack_pending}`);
    console.log(`Redelivered:       ${info.num_redelivered}`);
    console.log(`Delivered Seq:     ${delivered?.consumer_seq || 0}`);
    console.log(`Ack Floor Seq:     ${ackFloor?.consumer_seq || 0}`);
    console.log();
    console.log(`Status: ${info.num_pending === 0 ? '✅ Caught up' : '⚠️ Backlog detected'}`);

  } catch (e) {
    console.error(`❌ Consumer not found: ${stream}/${durable}`);
    console.error(e.message);
  }

  await nc.drain();
}

// CLI usage: node consumer-diagnostic.js <stream> <durable>
if (require.main === module) {
  const stream = process.argv[2] || 'AA_CORE_HOT';
  const durable = process.argv[3] || 'normalize-hrv-durable';
  diagnoseConsumer(stream, durable).catch(console.error);
}

module.exports = { diagnoseConsumer };
