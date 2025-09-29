import Fastify, { FastifyInstance } from 'fastify';
import { AdaptiveSuggestionSchema, AdaptiveAdjustmentSchema, ReadinessTodaySchema } from '@athlete-ally/shared-types';

function flagStub(): boolean { return (process.env.ADAPTATION_STUB || 'true').toLowerCase() === 'true'; }
function flagReadiness(): boolean { return (process.env.READINESS_ADAPTATION || 'false').toLowerCase() === 'true'; }
function insightsUrl(): string { return process.env.INSIGHTS_URL || 'http://localhost:4103'; }
function insightsTimeoutMs(): number { return parseInt(process.env.INSIGHTS_TIMEOUT_MS || '1200'); }

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ status: 'healthy', service: 'adaptive-engine', timestamp: new Date().toISOString() }));

  app.get('/metrics', async (_req, reply) => { reply.type('text/plain'); return '# metrics placeholder\n'; });

  app.get('/adaptive/today', async (request, reply) => {
    const userId = (request.query as any)?.userId || 'demo-user';
    const date = new Date().toISOString().slice(0, 10);

    if (flagStub()) {
      const payload = { userId, date, adjustment: 'maintain', reasons: ['stub_mode_enabled'], timestamp: new Date().toISOString() };
      const validated = AdaptiveSuggestionSchema.parse(payload);
      return reply.code(200).send(validated);
    }

    if (!flagReadiness()) { return reply.code(204).send(); }

    try {
      const readiness = await fetchReadinessToday(userId);
      if (readiness.status === 404) return reply.code(404).send();
      if (readiness.status >= 500) return reply.code(204).send();
      const data = readiness.data!;
      const adjustment = bucketAdjustment(data.readinessScore);
      const suggestion = AdaptiveSuggestionSchema.parse({
        userId: data.userId,
        date: data.date,
        adjustment: adjustment.adjustment,
        readinessScore: data.readinessScore,
        readinessBucket: adjustment.bucket,
        reasons: ['readiness_bucket_' + adjustment.bucket],
        timestamp: new Date().toISOString(),
      });
      return reply.code(200).send(suggestion);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ETIMEDOUT') return reply.code(204).send();
      request.log.error({ err }, 'adaptive suggestion failed');
      return reply.code(204).send();
    }
  });

  return app;
}

export function bucketAdjustment(score: number): { adjustment: typeof AdaptiveAdjustmentSchema._type; bucket: 'low'|'medium'|'high'|'very_high' } {
  if (score < 40) return { adjustment: 'reduce', bucket: 'low' } as any;
  if (score <= 60) return { adjustment: 'maintain', bucket: 'medium' } as any;
  if (score <= 80) return { adjustment: 'slight_increase', bucket: 'high' } as any;
  return { adjustment: 'increase', bucket: 'very_high' } as any;
}

export async function fetchReadinessToday(userId: string): Promise<{ status: number; data?: { userId: string; date: string; readinessScore: number } }> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), insightsTimeoutMs());
  try {
    const url = `${insightsUrl()}/readiness/today?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 404) return { status: 404 };
    if (res.status >= 500) return { status: res.status };
    if (!res.ok) return { status: res.status };
    const json = await res.json();
    const parsed = ReadinessTodaySchema.parse(json);
    return { status: 200, data: parsed };
  } finally {
    clearTimeout(to);
  }
}

async function start() {
  const app = buildServer();
  const port = parseInt(process.env.PORT || '4104');
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`adaptive-engine listening on ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (require.main === module) { start(); }
