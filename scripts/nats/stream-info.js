#!/usr/bin/env node
const { connect } = require('nats');
(async () => {
  const url = process.env.NATS_URL || 'nats://localhost:4222';
  const stream = process.argv[2] || 'ATHLETE_ALLY_EVENTS';
  const nc = await connect({ servers: url });
  const jsm = await nc.jetstreamManager();
  try {
    const info = await jsm.streams.info(stream);
    console.log(JSON.stringify({
      name: info.config.name,
      subjects: info.config.subjects,
      retention: info.config.retention,
      max_age: info.config.max_age,
    }, null, 2));
  } catch (e) {
    console.error('stream info error:', e && e.message || e);
    process.exitCode = 1;
  } finally {
    await nc.close();
  }
})();
