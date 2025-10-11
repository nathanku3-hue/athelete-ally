import Fastify from 'fastify';
import { EventBus } from '@athlete-ally/event-bus';
import { PrismaClient } from '../prisma/generated/client';
import { EventHandlers } from './eventHandlers';
import { readinessRoutes } from './routes/readiness';
import { readinessV1Routes } from './routes/readinessV1';

const fastify = Fastify({
  logger: true
});

// EventBus and Prisma connections
let eventBus: EventBus | null = null;
let prisma: PrismaClient | null = null;
let eventHandlers: EventHandlers | null = null;

async function connectEventBus() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4223';
    eventBus = new EventBus();
    await eventBus.connect(natsUrl);
    console.log('Connected to EventBus');
  } catch (err) {
    console.error('Failed to connect to EventBus:', err);
    process.exit(1);
  }
}

async function connectDatabase() {
  try {
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Connected to database');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

async function initializeEventHandlers() {
  if (!eventBus || !prisma) {
    throw new Error('EventBus and Prisma must be initialized first');
  }

  eventHandlers = new EventHandlers(eventBus, prisma);
  await eventHandlers.subscribeToHrvNormalizedEvents();
  console.log('Event handlers initialized');
}

// Register routes
fastify.register(readinessRoutes);
fastify.register(readinessV1Routes);

// Feature flag: READINESS_STUB
if (process.env.READINESS_STUB === 'true') {
  console.log('READINESS_STUB enabled - returning static responses');

  fastify.get('/api/v1/readiness/today', async (_request, reply) => {
    return reply.code(200).send({
      userId: 'stub-user',
      date: new Date().toISOString().split('T')[0],
      readinessScore: 85,
      drivers: [
        { key: 'hrvDelta', label: 'HRV Delta', value: 0.15 },
        { key: 'trend3d', label: '3-Day Trend', value: -0.05 },
        { key: 'dataFreshness', label: 'Data Freshness', value: 0.95 }
      ],
      timestamp: new Date().toISOString()
    });
  });

  fastify.get('/api/v1/readiness', async (_request, reply) => {
    const today = new Date().toISOString().split('T')[0];
    return reply.code(200).send([
      {
        date: today,
        readinessScore: 85,
        drivers: [
          { key: 'hrvDelta', label: 'HRV Delta', value: 0.15 },
          { key: 'trend3d', label: '3-Day Trend', value: -0.05 },
          { key: 'dataFreshness', label: 'Data Freshness', value: 0.95 }
        ]
      }
    ]);
  });
}

const start = async () => {
  try {
    // Connect to external services
    await connectEventBus();
    await connectDatabase();
    
    // Initialize event handlers
    await initializeEventHandlers();
    
    // Start HTTP server
    const port = parseInt(process.env.PORT || '4103');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Insights Engine service listening on port ${port}`);
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  if (prisma) {
    await prisma.$disconnect();
  }
  
  if (eventBus) {
    // EventBus doesn't have disconnect method, just log
    console.log('EventBus connection closed');
  }
  
  await fastify.close();
  process.exit(0);
});

start();
