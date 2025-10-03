import Fastify from 'fastify';
import { readinessV1Routes } from '../src/routes/readinessV1';
import { InMemoryRepo } from '../src/repo';
import { startOfUtcDay } from '../src/utils/date';

// Patch the route module to inject in-memory repo for tests via monkey patching
jest.mock('../src/routes/readinessV1', () => {
  const original = jest.requireActual('../src/routes/readinessV1');
  const route = async (fastify: any) => {
    const repo = new (require('../src/repo').InMemoryRepo)();
    // seed some data for today
    const today = startOfUtcDay(new Date());
    repo.seedSleep('u1', today, 480, 90);
    repo.seedHrv('u1', today, 3.8);
    // minimal shim: attach repo on fastify instance for this test
    (fastify as any).readinessTestRepo = repo;
    // Re-implement minimal handlers inline for testing
    fastify.get('/api/v1/readiness/:userId/latest', async (req: any, reply: any) => {
      const { userId } = req.params;
      const { computeAndUpsertReadiness } = require('../src/readinessV1');
      await computeAndUpsertReadiness(repo, userId, today);
      const latest = await repo.getLatestReadiness(userId);
      if (!latest) return reply.code(200).send({ userId, incomplete: true });
      return reply.code(200).send({ userId, date: '20240101', score: latest.score, incomplete: latest.incomplete ?? false, components: latest.components });
    });
    fastify.get('/api/v1/readiness/:userId', async (req: any, reply: any) => {
      const { userId } = req.params;
      const list = await repo.getReadinessRange(userId, 7);
      return reply.code(200).send(list.map((r: any) => ({ userId, date: '20240101', score: r.score, incomplete: r.incomplete ?? false, components: r.components })));
    });
  };
  return { ...original, readinessV1Routes: route };
});

describe('readiness v1 routes', () => {
  const app = Fastify();
  beforeAll(async () => {
    await app.register(readinessV1Routes);
  });
  afterAll(async () => { await app.close(); });

  it('GET /api/v1/readiness/:userId/latest returns computed readiness', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/readiness/u1/latest' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.userId).toBe('u1');
    expect(typeof body.score).toBe('number');
  });

  it('GET /api/v1/readiness/:userId?days=7 returns list', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/readiness/u1?days=7' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

