import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { consumerOpts, JsMsg, JetStreamPullSubscription } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
import { SpanStatusCode } from '@opentelemetry/api';

// Type definitions for better type safety
interface TelemetrySpan {
  setAttribute: (key: string, value: string | number) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  end: () => void;
  recordException: (err: unknown) => void;
}

interface TelemetryTracer {
  startActiveSpan: (name: string, fn: (span: TelemetrySpan) => Promise<void>) => Promise<void>;
}

interface TelemetryMeter {
    createCounter: (name: string, options: { description: string }) => {
      add: (value: number, labels: Record<string, string>) => void;
    };
}

interface TelemetryBootstrap {
  tracer: TelemetryTracer;
  meter: TelemetryMeter;
}

interface WithExtractedContext {
  (headers: Record<string, string>, fn: () => Promise<void>): Promise<void>;
}

// Optional telemetry bootstrap (fallback to no-op if package unavailable)
/* eslint-disable @typescript-eslint/no-require-imports */
let bootstrapTelemetry: (opts: unknown) => TelemetryBootstrap;
let withExtractedContext: WithExtractedContext;
try {
  ({ bootstrapTelemetry, withExtractedContext } = require('@athlete-ally/telemetry-bootstrap'));
} catch {
  // No-op fallbacks
  withExtractedContext = async (_headers: Record<string, string>, fn: () => Promise<void>) => await fn();
  bootstrapTelemetry = () => ({ 
    tracer: { 
      startActiveSpan: async (_name: string, fn: (span: TelemetrySpan) => Promise<void>) => await fn({ 
        setAttribute() {}, setStatus() {}, end() {}, recordException() {} 
      }) 
    },
    meter: { createCounter: () => ({ add: () => {} }) }
  });
}
/* eslint-enable @typescript-eslint/no-require-imports */

const prisma = new PrismaClient();
const BATCH_SIZE = 10;
const EXPIRES_MS = 5000;
const IDLE_BACKOFF_MS = 50;

// Bootstrap telemetry early (traces + Prometheus exporter)
const telemetry = bootstrapTelemetry({
  serviceName: 'normalize-service',
  traces: { enabled: true },
  metrics: { enabled: true, port: parseInt(process.env.PROMETHEUS_PORT || '9464'), endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics' },
});

let eventBus: EventBus;
let nc: any; // NatsConnection - keeping any for now as it's from EventBus
let running = true; // Global flag for graceful shutdown

// Lightweight HTTP server for health/metrics
const httpServer = Fastify({ logger: true });

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
    
    // Initialize EventBus
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    httpServer.log.info('Connected to EventBus');
    
    nc = eventBus.getNatsConnection();
    const js = eventBus.getJetStream();
    const jsm = eventBus.getJetStreamManager();
    
    // Durable JetStream consumer for HRV raw data
    try {
      const hrvDurable = process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-durable';
      const hrvMaxDeliver = parseInt(process.env.NORMALIZE_HRV_MAX_DELIVER || '5');
      const hrvDlq = process.env.NORMALIZE_HRV_DLQ_SUBJECT || 'dlq.normalize.hrv.raw-received';
      const hrvAckWaitMs = parseInt(process.env.NORMALIZE_HRV_ACK_WAIT_MS || '60000'); // 60s default

      // Create OTel counters for HRV metrics
      const hrvMessagesCounter = telemetry.meter.createCounter('normalize_hrv_messages_total', {
        description: 'Total number of HRV messages processed by normalize service',
      });

      // Stream binding order: AA_CORE_HOT first, then ATHLETE_ALLY_EVENTS
      const streamCandidates = (process.env.AA_STREAM_CANDIDATES || 'AA_CORE_HOT,ATHLETE_ALLY_EVENTS').split(',');
      let actualStreamName = '';

      // Only create consumers if explicitly enabled (default to true for development)
      if (process.env.FEATURE_SERVICE_MANAGES_CONSUMERS !== 'false') {
        for (const streamName of streamCandidates) {
          try {
            await jsm.consumers.add(streamName, {
          durable_name: hrvDurable,
          filter_subject: EVENT_TOPICS.HRV_RAW_RECEIVED,
              ack_policy: 'explicit' as any,
              deliver_policy: 'all' as any,
          max_deliver: hrvMaxDeliver,
              ack_wait: hrvAckWaitMs * 1_000_000, // Convert ms to ns
              max_ack_pending: 1000 // High capacity to avoid blocking
            });
            httpServer.log.info(`[normalize] HRV consumer created on ${streamName}: ${hrvDurable}`);
            actualStreamName = streamName;
            break; // Successfully created on this stream
          } catch (e) {
            // Consumer might already exist or stream not available
            httpServer.log.info(`[normalize] Attempted to create HRV consumer on ${streamName}: ${hrvDurable}. Error: ${(e as Error).message}. Trying next candidate.`);
          }
        }
      } else {
        // Default: try to bind to existing consumers
        for (const streamName of streamCandidates) {
          try {
            // Try to get consumer info to verify it exists
            await jsm.consumers.info(streamName, hrvDurable);
            actualStreamName = streamName;
            httpServer.log.info(`[normalize] Found existing HRV consumer on ${streamName}: ${hrvDurable}`);
            break;
          } catch (e) {
            httpServer.log.info(`[normalize] Consumer ${hrvDurable} not found on ${streamName}. Trying next candidate.`);
          }
        }
      }

      if (!actualStreamName) {
        throw new Error('Failed to find HRV consumer on any available stream. Ensure EventBus has created the consumer or set FEATURE_SERVICE_MANAGES_CONSUMERS=false to disable consumer creation.');
      }

      // Bind to existing durable consumer
      const opts = consumerOpts();
      opts.bind(actualStreamName, hrvDurable);
      opts.ackExplicit();
      opts.manualAck();
      opts.maxDeliver(hrvMaxDeliver);
      opts.ackWait(hrvAckWaitMs);

      const sub = await js.pullSubscribe(EVENT_TOPICS.HRV_RAW_RECEIVED, opts) as JetStreamPullSubscription;
        httpServer.log.info(`[normalize] HRV durable pull consumer bound: ${hrvDurable}, subject: ${EVENT_TOPICS.HRV_RAW_RECEIVED}, ackWait: ${hrvAckWaitMs}ms, maxDeliver: ${hrvMaxDeliver}`);

      // Message handler function
      async function handleHrvMessage(m: JsMsg) {
        const info = m.info;
        const meta = {
          streamSeq: info?.streamSequence,
          deliverySeq: info?.deliverySequence,
          redeliveries: info?.deliveryCount || 0,
          subject: m.subject,
        };
        
        httpServer.log.info(`[normalize] Processing HRV message: ${JSON.stringify(meta)}`);
        
        // Extract headers safely
        const hdrs = m.headers ? Object.fromEntries(
          Array.from(m.headers as Iterable<[string, string[]]>).map(([k, vals]) => [k, Array.isArray(vals) && vals.length ? vals[0] : ''])
        ) : {};

        await withExtractedContext(hdrs, async () => {
          await telemetry.tracer.startActiveSpan('normalize.hrv.consume', async (span: TelemetrySpan) => {

            // Add JetStream metadata attributes
            span.setAttribute('messaging.system', 'nats');
            span.setAttribute('messaging.destination', EVENT_TOPICS.HRV_RAW_RECEIVED);
            span.setAttribute('messaging.operation', 'process');
            if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
            if (typeof info.streamSequence === 'number') span.setAttribute('messaging.nats.stream_sequence', info.streamSequence);
            if (typeof info.deliverySequence === 'number') span.setAttribute('messaging.nats.delivery_sequence', info.deliverySequence);
            if (typeof info.deliveryCount === 'number') span.setAttribute('messaging.redelivery_count', Math.max(0, info.deliveryCount - 1));

            try {
              const text = m.string();
              httpServer.log.debug(`[normalize] HRV message text: ${text}`);
                const eventData = JSON.parse(text);
              httpServer.log.info(`[normalize] HRV event data: ${JSON.stringify({ ...eventData, userId: 'present' })}`); // PII protection

              // Validate event schema
                const validation = await eventValidator.validateEvent('hrv_raw_received', eventData as any);
                if (!validation.valid) {
                httpServer.log.warn(`[normalize] HRV validation failed: ${JSON.stringify(validation.errors)}`);
                hrvMessagesCounter.add(1, { result: 'schema_invalid', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: actualStreamName, durable: hrvDurable });

                // Schema validation failure is non-retryable - send to DLQ
                try {
                  await js.publish(`${hrvDlq}.schema-invalid`, m.data as any, { headers: m.headers });
                  httpServer.log.info(`[normalize] Sent schema-invalid message to DLQ: ${hrvDlq}.schema-invalid`);
                } catch (dlqErr) {
                  httpServer.log.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                m.term(); // Terminate - non-retryable
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'schema validation failed' });
                span.end();
                return;
              }

              httpServer.log.info(`[normalize] HRV validation passed, processing data...`);
                await processHrvData(eventData.payload);
              httpServer.log.info(`[normalize] HRV data processed successfully`);
              m.ack();
                    hrvMessagesCounter.add(1, { result: 'success', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: actualStreamName, durable: hrvDurable });
              span.setStatus({ code: SpanStatusCode.OK });
              } catch (err: unknown) {
              const deliveries = info?.deliveryCount || 1;
              const attempt = deliveries;

              // Determine if error is retryable
              const isRetryable = (err: unknown): boolean => {
                const errMsg = err instanceof Error ? err.message : String(err);
                return errMsg.includes('ECONNREFUSED') ||
                       errMsg.includes('timeout') ||
                       errMsg.includes('ETIMEDOUT') ||
                       errMsg.includes('Connection') ||
                       errMsg.includes('ENOTFOUND');
              };

                if (attempt >= hrvMaxDeliver) {
                httpServer.log.error(`[normalize] maxDeliver reached, sending to DLQ: ${JSON.stringify({ dlqSubject: hrvDlq, attempt })}`);
                try {
                  await js.publish(`${hrvDlq}.max-deliver`, m.data as any, { headers: m.headers });
                } catch (dlqErr) {
                  httpServer.log.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                m.term();
                hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: actualStreamName, durable: hrvDurable });
              } else if (isRetryable(err)) {
                httpServer.log.warn(`[normalize] Retryable error, NAK with delay: ${JSON.stringify({ attempt, maxDeliver: hrvMaxDeliver, error: err instanceof Error ? err.message : String(err) })}`);
                m.nak(5000); // 5s delay for retry
                hrvMessagesCounter.add(1, { result: 'retry', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: actualStreamName, durable: hrvDurable });
              } else {
                httpServer.log.error(`[normalize] Non-retryable error, sending to DLQ: ${JSON.stringify({ dlqSubject: hrvDlq, error: err instanceof Error ? err.message : String(err) })}`);
                try {
                  await js.publish(`${hrvDlq}.non-retryable`, m.data as any, { headers: m.headers });
                } catch (dlqErr) {
                  httpServer.log.error(`[normalize] Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                }
                m.term();
                hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: actualStreamName, durable: hrvDurable });
              }
              span.recordException(err);
              span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : 'Unknown error' });
            } finally {
              span.end();
            }
          });
        });
      }

      // Pull consumer loop - using stable pull+iterator pattern
      (async () => {
        httpServer.log.info(`[normalize] Starting HRV message processing loop...`);
        try {
          while (running) {
            try {
              await sub.pull({ batch: BATCH_SIZE, expires: EXPIRES_MS });

              let processed = 0;
              const deadline = Date.now() + EXPIRES_MS + 100;
              
              for await (const m of sub) {
                if (processed > 0 && processed % 3 === 0) {
                  m.working(); // Extend ack_wait for long handlers
                }
                await handleHrvMessage(m);
                processed++;
                if (processed >= BATCH_SIZE || Date.now() >= deadline) break;
              }
              
              if (processed === 0) {
                httpServer.log.info(`[normalize] No messages pulled, waiting...`);
              }
            } catch (err: unknown) {
              if (!running) break;
              httpServer.log.error(`[normalize] Pull/process error: ${JSON.stringify(err)}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            await new Promise(resolve => setTimeout(resolve, IDLE_BACKOFF_MS));
          }
        } catch (err) {
          if (!running) {
            httpServer.log.info('[normalize] HRV consumer loop stopped due to shutdown');
          } else {
            httpServer.log.error(`[normalize] HRV consumer loop error: ${JSON.stringify(err)}`);
          }
        }
        httpServer.log.info('[normalize] HRV message processing loop exited');
      })();
    } catch (e) {
      httpServer.log.error(`Failed to initialize durable HRV consumer: ${JSON.stringify(e)}`);
      throw e;
    }

    // Durable JetStream consumer for vendor Oura webhook with DLQ strategy
    try {
      const js = eventBus.getJetStream();
      const jsm = eventBus.getJetStreamManager();
      const durableName = process.env.NORMALIZE_DURABLE_NAME || 'normalize-oura';
      const subj = 'vendor.oura.webhook.received';
      const maxDeliver = parseInt(process.env.NORMALIZE_OURA_MAX_DELIVER || '5');
      const dlqSubject = process.env.NORMALIZE_DLQ_SUBJECT || 'dlq.vendor.oura.webhook';
      const ackWaitMs = parseInt(process.env.NORMALIZE_OURA_ACK_WAIT_MS || '15000');

      // Create OTel counters for metrics
      const messagesCounter = telemetry.meter.createCounter('normalize_messages_total', {
        description: 'Total number of messages processed by normalize service',
      });
      const redeliveriesCounter = telemetry.meter.createCounter('normalize_redeliveries_total', {
        description: 'Total number of message redeliveries',
      });

      try {
        const stream = await (jsm as any).streams.find(subj);
        httpServer.log.info(`[normalize] Oura subject stream: ${JSON.stringify(stream)}`);
      } catch {
        httpServer.log.warn(`[normalize] Oura subject stream not found; ensure JetStream stream includes ${subj}`);
      }

      const opts = consumerOpts();
      opts.durable(durableName);
      opts.deliverAll();
      opts.ackExplicit();
      opts.manualAck();
      opts.maxDeliver(maxDeliver);
      opts.ackWait(ackWaitMs);
      const sub = await js.pullSubscribe(subj, opts);

      (async () => {
        for await (const m of sub) {
          const msg = m as JsMsg;
          const hdrs = msg.headers ? Object.fromEntries(
            Array.from(msg.headers as Iterable<[string, string[]]>).map(([k, vals]) => [k, Array.isArray(vals) && vals.length ? vals[0] : ''])
          ) : {};
          
          await withExtractedContext(hdrs, async () => {
            await telemetry.tracer.startActiveSpan('normalize.oura.consume', async (span: TelemetrySpan) => {
              span.setAttribute('messaging.system', 'nats');
              span.setAttribute('messaging.destination', subj);
              span.setAttribute('messaging.operation', 'process');
              
              // Add JetStream metadata attributes
              const info = msg.info;
              if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
              if (typeof info.streamSequence === 'number') span.setAttribute('messaging.nats.stream_sequence', info.streamSequence);
              if (typeof info.deliverySequence === 'number') span.setAttribute('messaging.nats.delivery_sequence', info.deliverySequence);
              if (typeof info.deliveryCount === 'number') span.setAttribute('messaging.redelivery_count', Math.max(0, info.deliveryCount - 1));
              
              try {
                const text = msg.string();
                if (!text || text[0] !== '{') {
                  httpServer.log.warn('Oura webhook payload is not valid JSON');
                  messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                  msg.term();
                  span.setStatus({ code: SpanStatusCode.ERROR, message: 'Oura webhook payload is not valid JSON' });
                  span.end();
                  return;
                }
                const eventData = JSON.parse(text);
                httpServer.log.info(`Oura webhook event: ${JSON.stringify(eventData)}`);

                // Validate event schema
                const validation = await eventValidator.validateEvent('vendor_oura_webhook_received', eventData as any);
                if (!validation.valid) {
                  httpServer.log.warn(`Oura webhook validation failed: ${JSON.stringify(validation.errors)}`);
                  messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                  // Schema validation failure is non-retryable - send to DLQ
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    httpServer.log.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                  }
                  msg.term();
                  span.setStatus({ code: SpanStatusCode.ERROR, message: 'Oura webhook validation failed' });
                  span.end();
                  return;
                }

                // Process Oura webhook data
                msg.ack();
                messagesCounter.add(1, { result: 'success', subject: subj });
                span.setStatus({ code: SpanStatusCode.OK });
              } catch (err: unknown) {
                const deliveries = (msg.info && typeof msg.info.deliveryCount === 'number') ? msg.info.deliveryCount : (msg.redelivered ? 2 : 1);
                const attempt = deliveries;
                redeliveriesCounter.add(1, { subject: subj, attempt: attempt.toString() });

                // Determine if error is retryable
                const isRetryable = (err: unknown): boolean => {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  return errMsg.includes('ECONNREFUSED') ||
                         errMsg.includes('timeout') ||
                         errMsg.includes('ETIMEDOUT') ||
                         errMsg.includes('Connection') ||
                         errMsg.includes('ENOTFOUND');
                };
                  
                  if (attempt >= maxDeliver) {
                  httpServer.log.error(`maxDeliver reached, sending to DLQ: ${JSON.stringify({ dlqSubject, attempt })}`);
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    httpServer.log.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                  }
                  msg.term();
                    messagesCounter.add(1, { result: 'dlq', subject: subj });
                } else if (isRetryable(err)) {
                  httpServer.log.warn(`Retryable error, NAK with delay: ${JSON.stringify({ attempt, maxDeliver, error: err instanceof Error ? err.message : String(err) })}`);
                  msg.nak(5000); // 5s delay for retry
                  messagesCounter.add(1, { result: 'retry', subject: subj });
                  } else {
                  httpServer.log.error(`Non-retryable error, sending to DLQ: ${JSON.stringify({ dlqSubject, error: err instanceof Error ? err.message : String(err) })}`);
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    httpServer.log.error(`Failed to publish to DLQ: ${JSON.stringify(dlqErr)}`);
                  }
                  msg.term();
                  messagesCounter.add(1, { result: 'dlq', subject: subj });
                }
                span.recordException(err);
                span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : 'Unknown error' });
              } finally {
                span.end();
              }
            });
          });
        }
      })();
    } catch (e) {
      httpServer.log.error(`Failed to initialize durable Oura consumer: ${JSON.stringify(e)}`);
      throw e;
    }
  } catch (err) {
    httpServer.log.error(`Failed to connect to NATS: ${JSON.stringify(err)}`);
    throw err;
  }
}

async function processHrvData(payload: { userId: string; date: string; rmssd: number }) {
  try {
    const { userId, date, rmssd } = payload;
    
    if (!userId || !date || typeof rmssd !== 'number') {
      throw new Error('Invalid HRV payload: missing required fields');
    }

    // Calculate lnRmssd
    const lnRmssd = Math.log(rmssd);

    // Upsert HRV data
    const row = await prisma.hrvData.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date)
        }
      },
      update: {
        rmssd,
        lnRmssd,
        capturedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId,
        date: new Date(date),
        rmssd,
        lnRmssd,
        capturedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Publish normalized event
    const normalizedEvent: HRVNormalizedStoredEvent = {
      record: {
        userId: row.userId,
        date: typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0],
        rMSSD: row.rmssd ?? 0, // Handle null case
        lnRMSSD: row.lnRmssd ?? 0, // Handle null case
        readinessScore: 0,
        vendor: 'oura',
        capturedAt: row.capturedAt.toISOString()
      }
    };

      await eventBus.publishHRVNormalizedStored(normalizedEvent);
    httpServer.log.info(`[normalize] HRV data upserted and event published for date ${date}`);
  } catch (error) {
    httpServer.log.error(`[normalize] Error processing HRV data: ${JSON.stringify(error)}`);
    throw error;
  }
}

// Health check endpoint
httpServer.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check NATS connection
    if (!nc || nc.isClosed()) {
      throw new Error('NATS connection not available');
    }

    reply.send({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        nats: 'connected'
      }
    });
  } catch (error) {
    reply.status(503).send({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Metrics endpoint
httpServer.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
  reply.type('text/plain');
  reply.send('# Metrics endpoint handled by telemetry bootstrap');
});

async function start() {
  try {
    await connectNATS();
    
    const port = parseInt(process.env.PORT || '4112');
    await httpServer.listen({ port, host: '0.0.0.0' });
    httpServer.log.info(`Normalize service listening on port ${port}`);
  } catch (error) {
    httpServer.log.error(`Failed to start normalize service: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  httpServer.log.info('Received SIGINT, shutting down gracefully...');
  running = false;
  
  try {
    await httpServer.close();
    if (nc) await nc.close();
    await prisma.$disconnect();
    httpServer.log.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    httpServer.log.error(`Error during shutdown: ${JSON.stringify(error)}`);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  httpServer.log.info('Received SIGTERM, shutting down gracefully...');
  running = false;
  
  try {
    await httpServer.close();
    if (nc) await nc.close();
    await prisma.$disconnect();
    httpServer.log.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    httpServer.log.error(`Error during shutdown: ${JSON.stringify(error)}`);
    process.exit(1);
  }
});

// Start the service
start().catch((error) => {
  httpServer.log.error('Failed to start service:', error);
  process.exit(1);
});