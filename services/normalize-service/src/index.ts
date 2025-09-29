import Fastify from 'fastify';
import { connect } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';
import { Counter, Histogram, Registry, collectDefaultMetrics, register as globalRegistry } from 'prom-client';
import { context, propagation, trace, SpanStatusCode } from '@opentelemetry/api';

const prisma = new PrismaClient();
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
httpServer.addHook('onRequest', async (req) => { (req as any)._startTime = process.hrtime.bigint(); });
httpServer.addHook('onResponse', async (req, reply) => {
  try {
    const start = (req as any)._startTime as bigint | undefined;
    const route = (reply.request as any).routerPath || reply.request.url || 'unknown';
    const labels = { method: req.method, route, status: String(reply.statusCode) } as const;
    httpRequestsTotal.inc(labels);
    if (start) {
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      httpRequestDurationSeconds.observe(labels, seconds);
    }
  } catch {}
});


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
    console.log('Connected to EventBus');
    
    // Get NATS connection from EventBus for direct subscription
    nc = (eventBus as any).nc;
    
    // Subscribe to HRV raw data using typed topics and schema validation
    const hrvSub = nc.subscribe(EVENT_TOPICS.HRV_RAW_RECEIVED);
    (async () => {
      for await (const msg of hrvSub) {
        try {
          const eventData = JSON.parse(msg.data.toString());
          
          // Schema validation using event-bus validator
          const validation = await eventValidator.validateEvent('hrv_raw_received', eventData);
          if (!validation.valid) {
            console.error('HRV event validation failed:', validation.errors);
            // TODO: Send to DLQ
            continue;
          }
          
          await processHrvData(eventData.payload);
        } catch (error) {
          console.error('Error processing HRV data:', error);
          // TODO: Send to DLQ
        }
      }
    })();
    
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
