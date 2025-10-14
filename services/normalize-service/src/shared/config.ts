/**
 * Centralized configuration for normalize-service
 */

export const config = {
  // NATS configuration
  natsUrl: process.env.NATS_URL || 'nats://localhost:4223',

  // Service configuration
  port: parseInt(process.env.PORT || '4112'),
  host: process.env.HOST || '0.0.0.0',

  // Feature flags
  serviceManagesConsumers: process.env.FEATURE_SERVICE_MANAGES_CONSUMERS !== 'false',

  // Telemetry configuration
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9464'),
  prometheusEndpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics',

  // Consumer batch processing
  batchSize: 10,
  expiresMs: 5000,
  idleBackoffMs: 50,

  // HRV consumer configuration
  hrv: {
    durable: process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-durable',
    maxDeliver: parseInt(process.env.NORMALIZE_HRV_MAX_DELIVER || '5'),
    dlqSubject: process.env.NORMALIZE_HRV_DLQ_SUBJECT || 'dlq.normalize.hrv.raw-received',
    ackWaitMs: parseInt(process.env.NORMALIZE_HRV_ACK_WAIT_MS || '60000'),
  },

  // Sleep consumer configuration
  sleep: {
    durable: process.env.NORMALIZE_SLEEP_DURABLE || 'normalize-sleep-durable',
    maxDeliver: parseInt(process.env.NORMALIZE_SLEEP_MAX_DELIVER || '5'),
    dlqSubject: process.env.NORMALIZE_SLEEP_DLQ_SUBJECT || 'dlq.normalize.sleep.raw-received',
    ackWaitMs: parseInt(process.env.NORMALIZE_SLEEP_ACK_WAIT_MS || '60000'),
  },

  // Oura consumer configuration
  oura: {
    durable: process.env.NORMALIZE_DURABLE_NAME || 'normalize-oura',
    maxDeliver: parseInt(process.env.NORMALIZE_OURA_MAX_DELIVER || '5'),
    dlqSubject: process.env.NORMALIZE_DLQ_SUBJECT || 'dlq.vendor.oura.webhook',
    ackWaitMs: parseInt(process.env.NORMALIZE_OURA_ACK_WAIT_MS || '15000'),
  },
} as const;
