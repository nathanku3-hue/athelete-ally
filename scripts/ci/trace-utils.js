// Small utility to generate/parse W3C trace headers for tests.
const crypto = require('node:crypto');

function randomTraceId() {
  return crypto.randomBytes(16).toString('hex');
}

function randomSpanId() {
  return crypto.randomBytes(8).toString('hex');
}

function buildTraceparent(traceId, parentId, sampled = true) {
  // version-format: 00-<trace-id>-<span-id>-<flags>
  const flags = sampled ? '01' : '00';
  return `00-${traceId}-${parentId}-${flags}`;
}

module.exports = {
  randomTraceId,
  randomSpanId,
  buildTraceparent,
};

