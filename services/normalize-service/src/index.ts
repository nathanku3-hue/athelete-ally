import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { consumerOpts, JsMsg, StringCodec, JetStreamPullSubscription } from 'nats';
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
const sc = StringCodec();
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
let nc: any; // NatsConnection
let running = true; // Global flag for graceful shutdown

// Lightweight HTTP server for health/metrics
const httpServer = Fastify({ logger: true });

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
    
    // Initialize EventBus
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    console.log('Connected to EventBus');

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

      try {
        await jsm.consumers.add('ATHLETE_ALLY_EVENTS', {
          durable_name: hrvDurable,
          filter_subject: EVENT_TOPICS.HRV_RAW_RECEIVED,
          ack_policy: 'explicit' as any,
          deliver_policy: 'all' as any,
          max_deliver: hrvMaxDeliver,
          ack_wait: hrvAckWaitMs * 1_000_000, // Convert ms to ns
          max_ack_pending: 1000 // High capacity to avoid blocking
        });
        console.log(`[normalize] HRV consumer created: ${hrvDurable}`);
      } catch {
        console.log(`[normalize] HRV consumer might already exist: ${hrvDurable}`);
      }

      // Bind to existing durable consumer
      const opts = consumerOpts();
      opts.bind('ATHLETE_ALLY_EVENTS', hrvDurable);
      opts.ackExplicit();
      opts.manualAck();
      opts.maxDeliver(hrvMaxDeliver);
      opts.ackWait(hrvAckWaitMs);

      const sub = await js.pullSubscribe(EVENT_TOPICS.HRV_RAW_RECEIVED, opts) as JetStreamPullSubscription;
      console.log(`[normalize] HRV durable pull consumer bound: ${hrvDurable}, subject: ${EVENT_TOPICS.HRV_RAW_RECEIVED}, ackWait: ${hrvAckWaitMs}ms, maxDeliver: ${hrvMaxDeliver}`);

      // Message handler function
      async function handleHrvMessage(m: JsMsg) {
        const info = m.info;
        const meta = {
          streamSeq: info?.streamSequence,
          deliverySeq: info?.deliverySequence,
          redeliveries: info?.deliveryCount || 0,
          subject: m.subject,
        };
        
        console.log(`[normalize] Processing HRV message:`, meta);
        
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
              console.log(`[normalize] HRV message text:`, text);
              const eventData = JSON.parse(text);
              console.log(`[normalize] HRV event data:`, { ...eventData, userId: 'present' }); // PII protection

              // Validate event schema
              const validation = await eventValidator.validateEvent('hrv_raw_received', eventData as any);
              if (!validation.valid) {
                console.log(`[normalize] HRV validation failed:`, validation.errors);
                hrvMessagesCounter.add(1, { result: 'schema_invalid', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: m.info?.stream || 'unknown', durable: hrvDurable });

                // Schema validation failure is non-retryable - send to DLQ
                try {
                  await js.publish(`${hrvDlq}.schema-invalid`, m.data as any, { headers: m.headers });
                  console.log(`[normalize] Sent schema-invalid message to DLQ: ${hrvDlq}.schema-invalid`);
                } catch (dlqErr) {
                  console.error(`[normalize] Failed to publish to DLQ:`, dlqErr);
                }
                m.term(); // Terminate - non-retryable
                span.setStatus({ code: SpanStatusCode.ERROR, message: 'schema validation failed' });
                span.end();
                return;
              }

              console.log(`[normalize] HRV validation passed, processing data...`);
              await processHrvData(eventData.payload);
              console.log(`[normalize] HRV data processed successfully`);
              m.ack();
              hrvMessagesCounter.add(1, { result: 'success', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: m.info?.stream || 'unknown', durable: hrvDurable });
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
                console.error('[normalize] maxDeliver reached, sending to DLQ', { dlqSubject: hrvDlq, attempt });
                try {
                  await js.publish(`${hrvDlq}.max-deliver`, m.data as any, { headers: m.headers });
                } catch (dlqErr) {
                  console.error('[normalize] Failed to publish to DLQ:', dlqErr);
                }
                m.term();
                hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: m.info?.stream || 'unknown', durable: hrvDurable });
              } else if (isRetryable(err)) {
                console.warn('[normalize] Retryable error, NAK with delay', { attempt, maxDeliver: hrvMaxDeliver, error: err instanceof Error ? err.message : String(err) });
                m.nak(5000); // 5s delay for retry
                hrvMessagesCounter.add(1, { result: 'retry', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: m.info?.stream || 'unknown', durable: hrvDurable });
              } else {
                console.error('[normalize] Non-retryable error, sending to DLQ', { dlqSubject: hrvDlq, error: err instanceof Error ? err.message : String(err) });
                try {
                  await js.publish(`${hrvDlq}.non-retryable`, m.data as any, { headers: m.headers });
                } catch (dlqErr) {
                  console.error('[normalize] Failed to publish to DLQ:', dlqErr);
                }
                m.term();
                hrvMessagesCounter.add(1, { result: 'dlq', subject: EVENT_TOPICS.HRV_RAW_RECEIVED, stream: m.info?.stream || 'unknown', durable: hrvDurable });
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
        console.log(`[normalize] Starting HRV message processing loop...`);
        try {
          while (running) {
            try {
              await (sub.pull as Function).call(sub, { batch: BATCH_SIZE, expires: EXPIRES_MS });

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
                console.log(`[normalize] No messages pulled, waiting...`);
              }
            } catch (err: unknown) {
              if (!running) break;
              console.error('[normalize] Pull/process error:', err);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            await new Promise(resolve => setTimeout(resolve, IDLE_BACKOFF_MS));
          }
        } catch (err) {
          if (!running) {
            console.log('[normalize] HRV consumer loop stopped due to shutdown');
          } else {
            console.error('[normalize] HRV consumer loop error:', err);
          }
        }
        console.log('[normalize] HRV message processing loop exited');
      })();
    } catch (e) {
      console.error('Failed to initialize durable HRV consumer:', e);
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
        console.log('[normalize] Oura subject stream:', stream);
      } catch {
        console.warn('[normalize] Oura subject stream not found; ensure JetStream stream includes', subj);
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
                  console.warn('Oura webhook payload is not valid JSON');
                  messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                  msg.term();
                  span.setStatus({ code: SpanStatusCode.ERROR, message: 'Oura webhook payload is not valid JSON' });
                  span.end();
                  return;
                }
                const eventData = JSON.parse(text);
                console.log('Oura webhook event:', eventData);

                // Validate event schema
                const validation = await eventValidator.validateEvent('vendor_oura_webhook_received', eventData as any);
                if (!validation.valid) {
                  console.warn('Oura webhook validation failed:', validation.errors);
                  messagesCounter.add(1, { result: 'schema_invalid', subject: subj });
                  // Schema validation failure is non-retryable - send to DLQ
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    console.error('Failed to publish to DLQ:', dlqErr);
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
                  console.error('maxDeliver reached, sending to DLQ', { dlqSubject, attempt });
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    console.error('Failed to publish to DLQ:', dlqErr);
                  }
                  msg.term();
                  messagesCounter.add(1, { result: 'dlq', subject: subj });
                } else if (isRetryable(err)) {
                  console.warn('Retryable error, NAK with delay', { attempt, maxDeliver, error: err instanceof Error ? err.message : String(err) });
                  msg.nak(5000); // 5s delay for retry
                  messagesCounter.add(1, { result: 'retry', subject: subj });
                } else {
                  console.error('Non-retryable error, sending to DLQ', { dlqSubject, error: err instanceof Error ? err.message : String(err) });
                  try {
                    await js.publish(dlqSubject, msg.data as any, { headers: msg.headers });
                  } catch (dlqErr) {
                    console.error('Failed to publish to DLQ:', dlqErr);
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
      console.error('Failed to initialize durable Oura consumer:', e);
      throw e;
    }
  } catch (err) {
    console.error('Failed to connect to NATS:', err);
    throw err;
  }
}

async function processHrvData(payload: any) {
  try {
    const { userId, date, rmssd } = payload;
    
    if (!userId || !date || typeof rmssd !== 'number') {
      throw new Error('Invalid HRV payload: missing required fields');
    }

    // Calculate lnRmssd
    const lnRmssd = Math.log(rmssd);
    
    // Upsert HRV data
    await prisma.hrvData.upsert({
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
      eventId: `hrv-normalized-${userId}-${date}-${Date.now()}`,
      eventType: 'hrv_normalized_stored',
      timestamp: new Date().toISOString(),
      payload: {
        userId,
        date,
        rmssd,
        lnRmssd
      }
    };

    await eventBus.publishHrvNormalizedStored(normalizedEvent);
    console.log(`[normalize] HRV data upserted and event published for date ${date}`);
  } catch (error) {
    console.error('[normalize] Error processing HRV data:', error);
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
    console.log(`Normalize service listening on port ${port}`);
  } catch (error) {
    console.error('Failed to start normalize service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  running = false;
  
  try {
    await httpServer.close();
    if (nc) await nc.close();
    await prisma.$disconnect();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  running = false;
  
  try {
    await httpServer.close();
    if (nc) await nc.close();
    await prisma.$disconnect();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the service
start().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});