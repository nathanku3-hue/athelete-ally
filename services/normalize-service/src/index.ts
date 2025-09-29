import Fastify from 'fastify';
import { consumerOpts } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
// Optional telemetry bootstrap (fallback to no-op if package unavailable)
/* eslint-disable @typescript-eslint/no-require-imports */
interface TelemetryBootstrap {
  tracer: {
    startActiveSpan: (name: string, fn: (span: unknown) => Promise<void>) => Promise<void>;
  };
}
interface WithExtractedContext {
  (headers: Record<string, string>, fn: () => Promise<void>): Promise<void>;
}
let bootstrapTelemetry: (opts: unknown) => TelemetryBootstrap;
let withExtractedContext: WithExtractedContext;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ bootstrapTelemetry, withExtractedContext } = require('@athlete-ally/telemetry-bootstrap'));
} catch {
  withExtractedContext = async (_headers: Record<string, string>, fn: () => Promise<void>) => await fn();
  bootstrapTelemetry = (_opts: unknown) => ({ 
    tracer: { 
      startActiveSpan: async (_name: string, fn: (span: unknown) => Promise<void>) => await fn({ 
        setAttribute() {}, 
        setStatus() {}, 
        end() {}, 
        recordException() {} 
      }) 
    } 
  });
}
/* eslint-enable @typescript-eslint/no-require-imports */
import { Counter, Histogram, Registry, collectDefaultMetrics, register as globalRegistry } from 'prom-client';

const prisma = new PrismaClient();
// Bootstrap telemetry early (traces + Prometheus exporter)
const telemetry = bootstrapTelemetry({
  serviceName: 'normalize-service',
  traces: { enabled: true },
  metrics: { enabled: true, port: parseInt(process.env.PROMETHEUS_PORT || '9464'), endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics' },
});

// eslint-disable-next-line no-console
console.log('[normalize] node=%s telemetry.enabled=%s metrics.port=%s endpoint=%s',
  process.version,
  (process.env.TELEMETRY_ENABLED === 'true') || true,
  process.env.PROMETHEUS_PORT || '9464',
  process.env.PROMETHEUS_ENDPOINT || '/metrics');

// Lightweight HTTP server for health/metrics
const httpServer = Fastify({ logger: true });

// Service-local Prometheus metrics
const serviceRegistry = new Registry();
collectDefaultMetrics({ register: serviceRegistry });

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method','route','status'],
  registers: [serviceRegistry],
});
const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method','route','status'],
  buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5,10],
  registers: [serviceRegistry],
});
interface RequestWithStartTime extends Fastify.FastifyRequest {
  _startTime?: bigint;
}
interface RequestWithRouterPath extends Fastify.FastifyRequest {
  routerPath?: string;
}

httpServer.addHook('onRequest', async (req: RequestWithStartTime) => { 
  req._startTime = process.hrtime.bigint(); 
});
httpServer.addHook('onResponse', async (req: RequestWithStartTime, reply: Fastify.FastifyReply) => {
  try {
    const start = req._startTime;
    const route = (reply.request as RequestWithRouterPath).routerPath || reply.request.url || 'unknown';
    const labels = { method: req.method, route, status: String(reply.statusCode) } as const;
    httpRequestsTotal.inc(labels);
    if (start) {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      httpRequestDurationSeconds.observe(labels, seconds);
    }
  } catch {
    // Ignore errors in metrics collection
  }
});
  
// EventBus connection
let eventBus: EventBus | null = null;
let nc: unknown = null;

httpServer.get('/health', async () => ({
  status: 'healthy',
  service: 'normalize',
  timestamp: new Date().toISOString(),
  eventBus: eventBus ? 'connected' : 'disconnected',
  nats: nc ? 'connected' : 'disconnected'
}));

// Metrics endpoint (service + event-bus metrics)
httpServer.get('/metrics', async (request, reply) => {
  try {
    reply.type('text/plain');
    const merged = Registry.merge([globalRegistry, serviceRegistry]);
    return await merged.metrics();
  } catch {
    reply.code(500).send('# metrics collection error');
  }
});

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    
    // Initialize EventBus
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    // eslint-disable-next-line no-console
    console.log('Connected to EventBus');
    
    // Get NATS connection from EventBus for direct subscription
    nc = (eventBus as { nc: unknown }).nc;
    
    // Durable JetStream consumer for HRV raw data (JetStream)
    try {
      const js = (nc as { jetstream(): unknown }).jetstream();
      const jsm = await (nc as { jetstreamManager(): Promise<unknown> }).jetstreamManager();
      const hrvDurable = process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-consumer';
      const hrvMaxDeliver = parseInt(process.env.NORMALIZE_HRV_MAX_DELIVER || '5');
      const hrvDlq = process.env.NORMALIZE_HRV_DLQ_SUBJECT || 'athlete-ally.dlq.normalize.hrv_raw_received';
      try {
        await (jsm as { consumers: { add: (stream: string, config: unknown) => Promise<void> } }).consumers.add('ATHLETE_ALLY_EVENTS', {
          durable_name: hrvDurable,
          filter_subject: EVENT_TOPICS.HRV_RAW_RECEIVED,
          ack_policy: 1, // Explicit
          deliver_policy: 0, // All
          max_deliver: hrvMaxDeliver,
          ack_wait: 60_000_000_000
        });
      } catch {
        // Consumer might already exist
      }
      const opts = consumerOpts();
      opts.durable(hrvDurable);
      opts.deliverAll();
      opts.ackExplicit();
      opts.manualAck();
      opts.filterSubject(EVENT_TOPICS.HRV_RAW_RECEIVED);
      const sub = await (js as { subscribe: (subject: string, opts: unknown) => Promise<AsyncIterable<unknown>> }).subscribe(EVENT_TOPICS.HRV_RAW_RECEIVED, opts);
      (async () => {
        for await (const m of sub as AsyncIterable<{ headers?: Map<string, string[]>; data: Uint8Array | string; info?: { redelivered?: number; numDelivered?: number } }>) {
          const hdrs = m.headers ? Object.fromEntries([...m.headers].map(([k, v]) => [k, v[0]])) : undefined;
          await withExtractedContext(hdrs || {}, async () => {
            await telemetry.tracer.startActiveSpan('normalize.hrv.consume', async (span: unknown) => {
              try {
                const text = m.data instanceof Uint8Array ? Buffer.from(m.data).toString('utf8') : String(m.data);
                const eventData = JSON.parse(text);
                const validation = await eventValidator.validateEvent('hrv_raw_received', eventData);
                if (!validation.valid) {
                  const info = m.info || {};
                  const deliveries = typeof info.redelivered === 'number' ? info.redelivered : (typeof info.numDelivered === 'number' ? info.numDelivered - 1 : 0);
                  const attempt = deliveries + 1;
                  if (attempt >= hrvMaxDeliver) {
                    try { await js.publish(hrvDlq, m.data, { headers: m.headers }); } catch {}
                    m.term();
                  } else { m.nak(); }
                  span.setStatus({ code: 2, message: 'schema validation failed' });
                  span.end();
                  return;
                }
                await processHrvData(eventData.payload);
                m.ack();
                span.setStatus({ code: 1 });
              } catch (err: unknown) {
                const info = m.info || {};
                const deliveries = typeof info.redelivered === 'number' ? info.redelivered : (typeof info.numDelivered === 'number' ? info.numDelivered - 1 : 0);
                const attempt = deliveries + 1;
                if (attempt >= hrvMaxDeliver) {
                  try { await (js as { publish: (subject: string, data: unknown, opts?: { headers?: Map<string, string[]> }) => Promise<void> }).publish(hrvDlq, m.data, { headers: m.headers }); } catch {}
                  (m as { term(): void }).term();
                } else { (m as { nak(): void }).nak(); }
                (span as { recordException(err: unknown): void }).recordException(err);
                (span as { setStatus(status: { code: number; message?: string }): void }).setStatus({ code: 2, message: err instanceof Error ? err.message : 'Unknown error' });
              } finally { (span as { end(): void }).end(); }
            });
          });
        }
      })();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize durable HRV consumer:', e);
    }

    // Durable JetStream consumer for vendor Oura webhook with DLQ strategy
    try {
      const js = (nc as { jetstream(): unknown }).jetstream();
      const jsm = await (nc as { jetstreamManager(): Promise<unknown> }).jetstreamManager();
      const durableName = process.env.NORMALIZE_DURABLE_NAME || 'normalize-oura';
      const subj = 'vendor.oura.webhook.received';
      const maxDeliver = parseInt(process.env.NORMALIZE_OURA_MAX_DELIVER || '5');
      const dlqSubject = process.env.NORMALIZE_DLQ_SUBJECT || 'dlq.vendor.oura.webhook';
      const ackWaitMs = parseInt(process.env.NORMALIZE_OURA_ACK_WAIT_MS || '15000');
      const backoffMs = process.env.NORMALIZE_OURA_BACKOFF_MS || '250,1000,5000';

      // Create OTel counters for metrics
      const messagesCounter = telemetry.meter.createCounter('normalize_messages_total', {
        description: 'Total number of messages processed by normalize service',
      });
      const redeliveriesCounter = telemetry.meter.createCounter('normalize_redeliveries_total', {
        description: 'Total number of message redeliveries',
      });

      try {
        const stream = await jsm.streams.find(subj);
        console.log('[normalize] Oura subject stream:', stream);
      } catch {
        console.warn('[normalize] Oura subject stream not found; ensure JetStream stream includes', subj);
        console.warn('[normalize] Ensure a JetStream stream includes subject vendor.oura.webhook.received (e.g. STREAM=vendor.oura subjects=[vendor.oura.webhook.received])');
      }

      const opts = consumerOpts();
      opts.durable(durableName);
      opts.deliverAll();
      opts.ackExplicit();
      opts.manualAck();
      opts.maxDeliver(maxDeliver);
      opts.ackWait(ackWaitMs);
      const sub = await js.subscribe(subj, opts);

      (async () => {
        for await (const m of sub) {
          const hdrs = m.headers ? Object.fromEntries([...m.headers].map(([k, v]) => [k, v[0]])) : undefined;
          await withExtractedContext(hdrs, async () => {
            await telemetry.tracer.startActiveSpan('normalize.oura.consume', async (span: { setAttribute: (key: string, value: string | number) => void; setStatus: (status: { code: number; message?: string }) => void; recordException: (err: unknown) => void; end: () => void }) => {
              span.setAttribute('messaging.system', 'nats');
              span.setAttribute('messaging.destination', subj);
              span.setAttribute('messaging.operation', 'process');
              
              // Add JetStream metadata attributes
              const info = m.info || {};
              if (info.stream) span.setAttribute('messaging.nats.stream', info.stream);
              if (info.sequence) span.setAttribute('messaging.nats.sequence', info.sequence);
              if (info.redelivered !== undefined) span.setAttribute('messaging.redelivery_count', info.redelivered);
              
              try {
                const text = m.data instanceof Uint8Array ? Buffer.from(m.data).toString('utf8') : String(m.data);
                if (!text || text[0] !== '{') {
                  // eslint-disable-next-line no-console
                  console.warn('Oura webhook payload is not valid JSON');
                  messagesCounter.add(1, { result: 'invalid_json', subject: subj });
                  m.ack();
                  span.setStatus({ code: SpanStatusCode.OK });
                  span.end();
                  return;
                }
                const evt = JSON.parse(text);
                // eslint-disable-next-line no-console
                console.log('[normalize] received Oura webhook event keys:', Object.keys(evt || {}));
                messagesCounter.add(1, { result: 'processed', subject: subj });
                m.ack();
                span.setStatus({ code: SpanStatusCode.OK });
              } catch (err) {
                try {
                  const deliveries = typeof info.redelivered === 'number' ? info.redelivered : (typeof info.numDelivered === 'number' ? info.numDelivered - 1 : 0);
                  const attempt = deliveries + 1;
                  
                  if (attempt >= maxDeliver) {
                    // eslint-disable-next-line no-console
                    console.error('[normalize] maxDeliver reached, DLQ publish', { dlqSubject, attempt });
                    
                    // Enhanced DLQ headers with context
                    const dlqHeaders = new Map(m.headers || []);
                    dlqHeaders.set('x-dlq-reason', 'processing_failed');
                    dlqHeaders.set('x-dlq-attempt', attempt.toString());
                    dlqHeaders.set('x-dlq-durable', durableName);
                    dlqHeaders.set('x-original-subject', subj);
                    
                    await (js as { publish: (subject: string, data: unknown, opts?: { headers?: Map<string, string> }) => Promise<void> }).publish(dlqSubject, m.data, { headers: dlqHeaders });
                    messagesCounter.add(1, { result: 'dlq', subject: subj });
                    (m as { term(): void }).term();
                  } else {
                    // eslint-disable-next-line no-console
                    console.warn('[normalize] processing failed, NAK for redelivery', { attempt, maxDeliver });
                    redeliveriesCounter.add(1, { subject: subj });
                    messagesCounter.add(1, { result: 'failed', subject: subj });
                    (m as { nak(): void }).nak();
                  }
                } catch (pubErr) {
                  // eslint-disable-next-line no-console
                  console.error('DLQ handling error', pubErr);
                  messagesCounter.add(1, { result: 'failed', subject: subj });
                  (m as { nak(): void }).nak();
                }
                span.recordException(err as Error);
                span.setStatus({ code: SpanStatusCode.ERROR });
              } finally {
                span.end();
              }
            });
          });
        }
      })();
      // eslint-disable-next-line no-console
      console.log('[normalize] durable JetStream subscription active:', durableName, subj, 'ackWait:', ackWaitMs, 'backoff:', backoffMs);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize durable Oura consumer:', e);
    }

    // Subscribe to Sleep raw data (keep raw for now)
    const sleepSub = (nc as { subscribe: (subject: string) => AsyncIterable<{ data: Uint8Array | string }> }).subscribe('sleep.raw-received');
    (async () => {
      for await (const msg of sleepSub) {
        try {
          const data = JSON.parse(msg.data.toString());
          await processSleepData(data);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error processing Sleep data:', error);
          // TODO: Send to DLQ
        }
      }
    })();
    
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to NATS:', err);
    process.exit(1);
  }
}

async function processHrvData(data: { userId: string; date: string; rMSSD: number; capturedAt?: string | number }) {
  try {
    // Normalize HRV data
    const normalized = {
      userId: data.userId,
      date: new Date(data.date),
      rmssd: data.rMSSD, // Use rMSSD from typed event
      lnRmssd: data.rMSSD ? Math.log(data.rMSSD) : null,
      capturedAt: new Date(data.capturedAt || Date.now())
    };
    
    // Upsert to database
    await prisma.hrvData.upsert({
      where: {
        userId_date: {
          userId: normalized.userId,
          date: normalized.date
        }
      },
      update: normalized,
      create: normalized
    });
    
    // Create typed normalized event
    const normalizedEvent: HRVNormalizedStoredEvent = {
      record: {
        userId: data.userId,
        date: data.date, // Keep as string 'YYYY-MM-DD'
        rMSSD: data.rMSSD,
        lnRMSSD: normalized.lnRmssd || 0,
        readinessScore: 0, // TODO: Calculate actual readiness score
        vendor: 'unknown', // TODO: Extract from raw data
        capturedAt: data.capturedAt || new Date().toISOString()
      }
    };
    
    // Publish typed normalized event via EventBus
    if (eventBus) {
      await eventBus.publishHRVNormalizedStored(normalizedEvent);
    }
    
    // eslint-disable-next-line no-console
    console.log('HRV data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error normalizing HRV data:', error);
    throw error;
  }
}

async function processSleepData(data: { userId: string; date: string; totalSleep: number; deepSleep: number; lightSleep: number; remSleep: number; debtMin?: number; capturedAt?: string | number }) {
  try {
    // Normalize Sleep data
    const normalized = {
      userId: data.userId,
      date: new Date(data.date),
      totalSleep: data.totalSleep,
      deepSleep: data.deepSleep,
      lightSleep: data.lightSleep,
      remSleep: data.remSleep,
      debtMin: data.debtMin || 0, // TODO: Calculate rolling deficit
      capturedAt: new Date(data.capturedAt || Date.now())
    };
    
    // Upsert to database
    await prisma.sleepData.upsert({
      where: {
        userId_date: {
          userId: normalized.userId,
          date: normalized.date
        }
      },
      update: normalized,
      create: normalized
    });
    
    // Publish normalized event (keep raw NATS for sleep for now)
    if (nc) {
      await (nc as { publish: (subject: string, data: string) => Promise<void> }).publish('sleep.normalized-stored', JSON.stringify(normalized));
    }
    
    // eslint-disable-next-line no-console
    console.log('Sleep data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error normalizing Sleep data:', error);
    throw error;
  }
}

const start = async () => {
  try {
    await connectNATS();
    const port = parseInt(process.env.PORT || '4102');
    await httpServer.listen({ port, host: '0.0.0.0' });
    // eslint-disable-next-line no-console
    console.log('Normalize service listening on port ' + port);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start normalize service:', err);
    process.exit(1);
  }
};

start();