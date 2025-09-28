import Fastify from 'fastify';
import { registerOuraWebhookRoutes } from './oura';
import { connect as connectNats, NatsConnection } from 'nats';
import { EventBus } from '@athlete-ally/event-bus';
import { HRVRawReceivedEvent } from '@athlete-ally/contracts';



// NATS connection for vendor publishes (Oura)\nlet natsVendor: NatsConnection | null = null;

// EventBus connection
let eventBus: EventBus | null = null;

async function connectEventBus() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    console.log('Connected to EventBus');
  } catch (err) {
    console.error('Failed to connect to EventBus:', err);
    process.exit(1);
  }
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    service: 'ingest',
    timestamp: new Date().toISOString(),
    eventBus: eventBus ? 'connected' : 'disconnected'
  };
});

// HRV ingestion endpoint
fastify.post('/ingest/hrv', async (request, reply) => {
  try {
    const data = request.body as any;
    
    // Validate required fields
    if (!data.userId || !data.date || !data.rmssd) {
      reply.code(400).send({ error: 'Missing required fields: userId, date, rmssd' });
      return;
    }
    
    // Create typed HRV event
    const hrvEvent: HRVRawReceivedEvent = {
      payload: {
        userId: data.userId,
        date: data.date, // 'YYYY-MM-DD'
        rMSSD: data.rmssd,
        capturedAt: data.capturedAt || new Date().toISOString(),
        raw: data.raw || {}
      }
    };
    
    // Publish typed event via EventBus
    if (eventBus) {
      await eventBus.publishHRVRawReceived(hrvEvent);
    }
    
    return { status: 'received', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

// Sleep ingestion endpoint
fastify.post('/ingest/sleep', async (request, reply) => {
  try {
    // TODO: Add proper validation and event publishing for sleep data
    const data = request.body as any;
    
    // For now, keep raw NATS publishing for sleep (will be updated in future PR)
    // This maintains compatibility while we focus on HRV typed events
    if (eventBus && (eventBus as any).nc) {
      await (eventBus as any).nc.publish('sleep.raw-received', JSON.stringify(data));
    }
    
    return { status: 'received', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

const start = async () => {
  try {
    await connectEventBus();
    
    const port = parseInt(process.env.PORT || '4101');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Ingest service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
