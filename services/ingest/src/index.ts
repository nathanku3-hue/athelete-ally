import Fastify from 'fastify';
import { connect } from 'nats';

const fastify = Fastify({
  logger: true
});

// NATS connection
let nc: any = null;

async function connectNATS() {
  try {
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
    nc = await connect({ servers: natsUrl });
    console.log('Connected to NATS');
  } catch (err) {
    console.error('Failed to connect to NATS:', err);
    process.exit(1);
  }
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'healthy', 
    service: 'ingest',
    timestamp: new Date().toISOString(),
    nats: nc ? 'connected' : 'disconnected'
  };
});

// HRV ingestion endpoint
fastify.post('/ingest/hrv', async (request, reply) => {
  try {
    // TODO: Add proper validation and event publishing
    const data = request.body;
    
    // Publish to NATS for processing
    if (nc) {
      await nc.publish('hrv.raw-received', JSON.stringify(data));
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
    // TODO: Add proper validation and event publishing
    const data = request.body;
    
    // Publish to NATS for processing
    if (nc) {
      await nc.publish('sleep.raw-received', JSON.stringify(data));
    }
    
    return { status: 'received', timestamp: new Date().toISOString() };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Internal server error' });
  }
});

const start = async () => {
  try {
    await connectNATS();
    
    const port = parseInt(process.env.PORT || '4107');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Ingest service listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
