/**
 * HTTP routes for health and metrics endpoints
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { NatsConnection } from 'nats';
import { PrismaClient } from '../../prisma/generated/client';
import { register } from '../telemetry.js';

export function registerRoutes(
  server: FastifyInstance,
  prisma: PrismaClient,
  getNatsConnection: () => NatsConnection | null
): void {
  // Health check endpoint
  server.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
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
  server.get('/metrics', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain; version=0.0.4; charset=utf-8');
    return register.metrics();
  });
}
