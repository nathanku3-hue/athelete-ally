import { FastifyInstance } from 'fastify';
import { toYyyyMmDd, startOfUtcDay } from '../utils/date';
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaRepo } from '../repo';
import { computeAndUpsertReadiness } from '../readinessV1';
import crypto from 'crypto';

// Minimal metrics via a lightweight counters; we can swap to prom-client later
const metrics = {
  apiRequestsTotal: new Map<string, number>(),
  inc(route: string, status: number) {
    const key = `${route}|${status}`;
    this.apiRequestsTotal.set(key, (this.apiRequestsTotal.get(key) || 0) + 1);
  },
};

export async function readinessV1Routes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const repo = new PrismaRepo(prisma);

  fastify.get('/api/v1/readiness/:userId/latest', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      // Compute today if missing (idempotent)
      const today = startOfUtcDay(new Date());
      await computeAndUpsertReadiness(repo, userId, today);
      const latest = await repo.getLatestReadiness(userId);
      if (!latest) {
        metrics.inc('/api/v1/readiness/:userId/latest', 200);
        return reply.code(200).send({ userId, incomplete: true });
      }
      metrics.inc('/api/v1/readiness/:userId/latest', 200);
      return reply.code(200).send({
        userId: latest.userId,
        date: toYyyyMmDd(latest.date),
        score: latest.score,
        incomplete: latest.incomplete ?? false,
        components: latest.components ?? undefined,
      });
    } catch (err: any) {
      fastify.log.error({ err }, 'readiness latest failed');
      metrics.inc('/api/v1/readiness/:userId/latest', 500);
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  fastify.get('/api/v1/readiness/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { days } = request.query as { days?: string };
    const n = Math.max(1, Math.min(31, Number(days ?? '7') || 7));
    try {
      // Optionally compute today to ensure current value exists
      const today = startOfUtcDay(new Date());
      await computeAndUpsertReadiness(repo, userId, today);
      const list = await repo.getReadinessRange(userId, n);
      metrics.inc('/api/v1/readiness/:userId', 200);
      return reply.code(200).send(list.map(r => ({
        userId: r.userId,
        date: toYyyyMmDd(r.date),
        score: r.score,
        incomplete: r.incomplete ?? false,
        components: r.components ?? undefined,
      })));
    } catch (err: any) {
      fastify.log.error({ err }, 'readiness range failed');
      metrics.inc('/api/v1/readiness/:userId', 500);
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Expose a minimal metrics endpoint for these new counters
  fastify.get('/api/v1/metrics', async (_req, reply) => {
    reply.type('text/plain');
    let body = '';
    for (const [k, v] of metrics.apiRequestsTotal.entries()) {
      const [route, status] = k.split('|');
      body += `api_requests_total{route="${route}",status="${status}"} ${v}\n`;
    }
    return body;
  });
}

