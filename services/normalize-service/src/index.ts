import Fastify from 'fastify';
import { connect } from 'nats';
import { PrismaClient } from '../prisma/generated/client';
import { EventBus } from '@athlete-ally/event-bus';
import { EVENT_TOPICS, HRVNormalizedStoredEvent } from '@athlete-ally/contracts';
import { eventValidator } from '@athlete-ally/event-bus';

const prisma = new PrismaClient();
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

// Placeholder metrics endpoint (Task C will provide real metrics)
httpServer.get('/metrics', async (request, reply) => {
  reply.type('text/plain');
  return '# metrics placeholder\n';
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
