import Fastify from 'fastify';
import { connect, consumerOpts } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
// Optional telemetry bootstrap (fallback to no-op if package unavailable)
let bootstrapTelemetry: any, withExtractedContext: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ({ bootstrapTelemetry, withExtractedContext } = require('@athlete-ally/telemetry-bootstrap'));
} catch {
  withExtractedContext = async (_headers: any, fn: any) => await fn();
  bootstrapTelemetry = (_opts: any) => ({ tracer: { startActiveSpan: async (_name: string, fn: any) => await fn({ setAttribute() {}, setStatus() {}, end() {}, recordException() {} }) } });
}
import { SpanStatusCode } from '@opentelemetry/api';
import http from 'node:http';

const prisma = new PrismaClient();
// Bootstrap telemetry early (traces + Prometheus exporter)
const telemetry = bootstrapTelemetry({
  serviceName: 'normalize-service',
  traces: { enabled: true },
  metrics: { enabled: true, port: parseInt(process.env.PROMETHEUS_PORT || '9464'), endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics' },
});

console.log('[normalize] node=%s telemetry.enabled=%s metrics.port=%s endpoint=%s',
  process.version,
  (process.env.TELEMETRY_ENABLED === 'true') || true,
  process.env.PROMETHEUS_PORT || '9464',
  process.env.PROMETHEUS_ENDPOINT || '/metrics');

// Lightweight HTTP server for health/metrics
const httpServer = Fastify({ logger: true });


// EventBus connection
let eventBus: EventBus | null = null;
let nc: any = null;

httpServer.get('/health', async () => ({
  status: 'healthy',
  service: 'normalize',
  timestamp: new Date().toISOString(),
  eventBus: eventBus ? 'connected' : 'disconnected',
  nats: nc ? 'connected' : 'disconnected'
}));

// Proxy /metrics to the Prometheus exporter
httpServer.get('/metrics', async (_request, reply) => {
  const port = parseInt(process.env.PROMETHEUS_PORT || '9464');
  const endpoint = process.env.PROMETHEUS_ENDPOINT || '/metrics';
  const opts = { host: '127.0.0.1', port, path: endpoint, method: 'GET', headers: { Accept: 'text/plain' } };
  const chunks: Buffer[] = [];
  const data = await new Promise<Buffer>((resolve, reject) => {
    const req = http.request(opts, (res) => {
      res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.end();
  }).catch((err) => {
    httpServer.log.error({ err }, 'metrics exporter not available');
    return Buffer.from('# metrics unavailable\n');
  });
  reply.type('text/plain').send(data);
});

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    
    // Initialize EventBus
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    console.log('Connected to EventBus');
    
    // Get NATS connection from EventBus for direct subscription
    nc = (eventBus as any).nc;
    
    // Durable JetStream consumer for HRV raw data (JetStream)
    try {
      const js = nc.jetstream();
      const jsm = await nc.jetstreamManager();
      const hrvDurable = process.env.NORMALIZE_HRV_DURABLE || 'normalize-hrv-consumer';
      const hrvMaxDeliver = parseInt(process.env.NORMALIZE_HRV_MAX_DELIVER || '5');
      const hrvDlq = process.env.NORMALIZE_HRV_DLQ_SUBJECT || 'athlete-ally.dlq.normalize.hrv_raw_received';
      try {
        await jsm.consumers.add('ATHLETE_ALLY_EVENTS', {
          durable_name: hrvDurable,
          filter_subject: EVENT_TOPICS.HRV_RAW_RECEIVED,
          ack_policy: 1, // Explicit
          deliver_policy: 0, // All
          max_deliver: hrvMaxDeliver,
          ack_wait: 60_000_000_000
        } as any);
      } catch {}
      const opts = consumerOpts();
      opts.durable(hrvDurable);
      opts.deliverAll();
      opts.ackExplicit();
      opts.manualAck();
      opts.filterSubject(EVENT_TOPICS.HRV_RAW_RECEIVED);
      const sub = await js.subscribe(EVENT_TOPICS.HRV_RAW_RECEIVED, opts);
      (async () => {
        for await (const m of sub) {
          const hdrs = m.headers ? Object.fromEntries([...m.headers].map(([k, v]) => [k, v[0]])) : undefined;
          await withExtractedContext(hdrs, async () => {
            await telemetry.tracer.startActiveSpan('normalize.hrv.consume', async (span: any) => {
              try {
                const text = m.data instanceof Uint8Array ? Buffer.from(m.data).toString('utf8') : String(m.data);
                const eventData = JSON.parse(text);
                const validation = await eventValidator.validateEvent('hrv_raw_received', eventData);
                if (!validation.valid) {
                  const info: any = (m as any).info || {};
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
              } catch (err: any) {
                const info: any = (m as any).info || {};
                const deliveries = typeof info.redelivered === 'number' ? info.redelivered : (typeof info.numDelivered === 'number' ? info.numDelivered - 1 : 0);
                const attempt = deliveries + 1;
                if (attempt >= hrvMaxDeliver) {
                  try { await js.publish(hrvDlq, m.data, { headers: m.headers }); } catch {}
                  m.term();
                } else { m.nak(); }
                span.recordException(err);
                span.setStatus({ code: 2, message: err?.message });
              } finally { span.end(); }
            });
          });
        }
      })();
    } catch (e) {
      console.error('Failed to initialize durable HRV consumer:', e);
    }

    // Durable JetStream consumer for vendor Oura webhook with DLQ strategy
    try {
      const js = nc.jetstream();
      const jsm = await nc.jetstreamManager();
      const durableName = process.env.NORMALIZE_DURABLE_NAME || 'normalize-oura';
      const subj = 'vendor.oura.webhook.received';
      const maxDeliver = parseInt(process.env.NORMALIZE_OURA_MAX_DELIVER || '5');
      const dlqSubject = process.env.NORMALIZE_DLQ_SUBJECT || 'dlq.vendor.oura.webhook';

      try {
        const stream = await jsm.streams.find(subj);
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
      const sub = await js.subscribe(subj, opts);

      (async () => {
        for await (const m of sub) {
          const hdrs = m.headers ? Object.fromEntries([...m.headers].map(([k, v]) => [k, v[0]])) : undefined;
          await withExtractedContext(hdrs, async () => {
            await telemetry.tracer.startActiveSpan('normalize.oura.consume', async (span: any) => {
              span.setAttribute('messaging.system', 'nats');
              span.setAttribute('messaging.destination', subj);
              span.setAttribute('messaging.operation', 'process');
              try {
                const text = m.data instanceof Uint8Array ? Buffer.from(m.data).toString('utf8') : String(m.data);
                if (!text || text[0] !== '{') {
                  console.warn('Oura webhook payload is not valid JSON');
                  m.ack();
                  span.setStatus({ code: SpanStatusCode.OK });
                  span.end();
                  return;
                }
                const evt = JSON.parse(text);
                console.log('[normalize] received Oura webhook event keys:', Object.keys(evt || {}));
                m.ack();
                span.setStatus({ code: SpanStatusCode.OK });
              } catch (err) {
                try {
                  const info: any = (m as any).info || {};
                  const deliveries = typeof info.redelivered === 'number' ? info.redelivered : (typeof info.numDelivered === 'number' ? info.numDelivered - 1 : 0);
                  const attempt = deliveries + 1;
                  if (attempt >= maxDeliver) {
                    console.error('[normalize] maxDeliver reached, DLQ publish', { dlqSubject, attempt });
                    await js.publish(dlqSubject, m.data, { headers: m.headers });
                    m.term();
                  } else {
                    console.warn('[normalize] processing failed, NAK for redelivery', { attempt, maxDeliver });
                    m.nak();
                  }
                } catch (pubErr) {
                  console.error('DLQ handling error', pubErr);
                  m.nak();
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
      console.log('[normalize] durable JetStream subscription active:', durableName, subj);
    } catch (e) {
      console.error('Failed to initialize durable Oura consumer:', e);
    }

    // Subscribe to Sleep raw data (keep raw for now)
    const sleepSub = nc.subscribe('sleep.raw-received');
    (async () => {
      for await (const msg of sleepSub) {
        try {
          const data = JSON.parse(msg.data.toString());
          await processSleepData(data);
        } catch (error) {
          console.error('Error processing Sleep data:', error);
          // TODO: Send to DLQ
        }
      }
    })();
    
  } catch (err) {
    console.error('Failed to connect to NATS:', err);
    process.exit(1);
  }
}

async function processHrvData(data: any) {
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
    
    console.log('HRV data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    console.error('Error normalizing HRV data:', error);
    throw error;
  }
}

async function processSleepData(data: any) {
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
      await nc.publish('sleep.normalized-stored', JSON.stringify(normalized));
    }
    
    console.log('Sleep data normalized and stored:', normalized.userId, normalized.date);
  } catch (error) {
    console.error('Error normalizing Sleep data:', error);
    throw error;
  }
}

const start = async () => {
  try {
    await connectNATS();
    const port = parseInt(process.env.PORT || '4102');
    await httpServer.listen({ port, host: '0.0.0.0' });
    console.log('Normalize service listening on port ' + port);
  } catch (err) {
    console.error('Failed to start normalize service:', err);
    process.exit(1);
  }
};

start();
