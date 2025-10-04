import { FastifyInstance } from 'fastify';
import { toYyyyMmDd, startOfUtcDay } from '../utils/date';
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaRepo } from '../repo';
import { computeAndUpsertReadiness } from '../readinessV1';
import { timeCompute, incHttpRequest, renderMetrics } from '../metrics';

export async function readinessV1Routes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const repo = new PrismaRepo(prisma);

  fastify.get('/api/v1/readiness/:userId/latest', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      // Compute today if missing (idempotent), record metrics
      const today = startOfUtcDay(new Date());
      const t = await timeCompute('latest', userId, async () => {
        await computeAndUpsertReadiness(repo, userId, today);
        return true;
      });
      const latest = await repo.getLatestReadiness(userId);
      if (!latest) {
        incHttpRequest('GET', '/api/v1/readiness/:userId/latest', 200);
        return reply.code(200).send({ userId, incomplete: true });
      }
      incHttpRequest('GET', '/api/v1/readiness/:userId/latest', 200);
      return reply.code(200).send({
        userId: latest.userId,
        date: toYyyyMmDd(latest.date),
        score: latest.score,
        incomplete: latest.incomplete ?? false,
        components: latest.components ?? undefined,
      });
    } catch (err: any) {
      fastify.log.error({ err }, 'readiness latest failed');
      incHttpRequest('GET', '/api/v1/readiness/:userId/latest', 500);
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
      await timeCompute('range', userId, async () => {
        await computeAndUpsertReadiness(repo, userId, today);
      });
      const list = await repo.getReadinessRange(userId, n);
      incHttpRequest('GET', '/api/v1/readiness/:userId', 200);
      return reply.code(200).send(list.map(r => ({
        userId: r.userId,
        date: toYyyyMmDd(r.date),
        score: r.score,
        incomplete: r.incomplete ?? false,
        components: r.components ?? undefined,
      })));
    } catch (err: any) {
      fastify.log.error({ err }, 'readiness range failed');
      incHttpRequest('GET', '/api/v1/readiness/:userId', 500);
      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  // Expose Prometheus metrics endpoint at /metrics
  fastify.get('/metrics', async (_req, reply) => {
    reply.type('text/plain');
    return await renderMetrics();
  });
}
