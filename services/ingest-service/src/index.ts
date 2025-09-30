import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerOuraWebhookRoutes } from './oura';
import { registerOuraOAuthRoutes } from './oura_oauth';
import { connect as connectNats, NatsConnection } from 'nats';
import { EventBus } from '@athlete-ally/event-bus';
import { HRVRawReceivedEvent } from '@athlete-ally/contracts';
import '@athlete-ally/shared/fastify-augment';
import { register, collectDefaultMetrics } from 'prom-client';

// Create Fastify instance
const fastify: FastifyInstance = Fastify({
  logger: true
});

// 确保默认指标只注册一次
let defaultMetricsRegistered = false;
if (!defaultMetricsRegistered) {
  collectDefaultMetrics({ register });
  defaultMetricsRegistered = true;
}

// NATS connection for vendor publishes (Oura)
let natsVendor: NatsConnection | null = null;

// Register Oura webhook route (HMAC verify + TTL idempotency)
registerOuraWebhookRoutes(fastify, { publish: async (subject, data) => {
  try {
    if (!natsVendor) {
      const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
      natsVendor = await connectNats({ servers: natsUrl });
    }
    await natsVendor.publish(subject, data);
  } catch (e) {
    fastify.log.error({ e }, 'Failed to publish Oura webhook to NATS');
  }
}});

// Register Oura OAuth flow if enabled
try { registerOuraOAuthRoutes(fastify); } catch (err) { fastify.log.warn({ err }, 'Oura OAuth disabled or misconfigured'); }

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
fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return { 
    status: 'healthy', 
    service: 'ingest',
    timestamp: new Date().toISOString(),
    eventBus: eventBus ? 'connected' : 'disconnected'
  };
});

// Metrics endpoint
fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
  reply.type(register.contentType);
  return register.metrics();
});

// HRV ingestion endpoint
const hrvHandler = async (request: FastifyRequest, reply: FastifyReply) => {
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
};


// Sleep ingestion endpoint
const sleepHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // TODO: Add proper validation and event publishing for sleep data
    const data = request.body as any;
    
    // For now, keep raw NATS publishing for sleep (will be updated in future PR)
    // This maintains compatibility while we focus on HRV typed events
    if (eventBus) {
      try {
        const nc = eventBus.getNatsConnection();
        await nc.publish('sleep.raw-received', new TextEncoder().encode(JSON.stringify(data)));
      } catch (err) {
        fastify.log.warn({ err }, 'EventBus not connected, skipping sleep publish');
      }
    }
    
    return { status: 'received', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
};

// Register routes with both old and new API paths
fastify.post('/ingest/hrv', hrvHandler);
fastify.post('/ingest/sleep', sleepHandler);
fastify.register(async function (fastify) {
  fastify.post('/ingest/hrv', hrvHandler);
  fastify.post('/ingest/sleep', sleepHandler);
}, { prefix: '/api/v1' });

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
