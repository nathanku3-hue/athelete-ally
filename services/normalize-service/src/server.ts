/**
 * HTTP server for health checks and metrics endpoints
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../prisma/generated/client/index.js';
import type { NatsConnection } from 'nats';
import { register } from './shared/metrics.js';
import { config } from './shared/config.js';

export function createHttpServer(prisma: PrismaClient, getNatsConnection: () => NatsConnection | null) {
  const httpServer = Fastify({ logger: true });

  // Health check endpoint
  httpServer.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      // Check NATS connection
      const nc = getNatsConnection();
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
  httpServer.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain; version=0.0.4; charset=utf-8');
    return register.metrics();
  });

  return httpServer;
}

export async function startHttpServer(httpServer: ReturnType<typeof Fastify>) {
  const port = config.port;
  await httpServer.listen({ port, host: '0.0.0.0' });
  httpServer.log.info(`Normalize service listening on port ${port}`);
}
