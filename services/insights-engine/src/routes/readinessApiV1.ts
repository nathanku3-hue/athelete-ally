import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../../prisma/generated/client';
import { format } from 'date-fns';
import { getMetricsRegistry } from '@athlete-ally/shared';
import { Counter, Histogram } from 'prom-client';
import { computeReadiness } from '../utils/computeReadiness';

// Optional telemetry bootstrap (traces)
let bootstrapTelemetry: any; let telemetry: any;
try { ({ bootstrapTelemetry } = require('@athlete-ally/telemetry-bootstrap')); telemetry = bootstrapTelemetry({ serviceName: 'insights-engine' }); } catch { telemetry = { tracer: { startActiveSpan: async (_: string, fn: (s: any)=>Promise<void>) => fn({ setAttribute(){}, setStatus(){}, end(){}, recordException(){}}) } } }

const register = getMetricsRegistry();
const readinessCounter = new Counter({ name: 'readiness_compute_total', help: 'Total readiness computations', labelNames: ['result'], registers: [register] });
const apiCounter = new Counter({ name: 'api_requests_total', help: 'API requests total', labelNames: ['route','status'], registers: [register] });
const readinessDuration = new Histogram({ name: 'readiness_compute_duration_seconds', help: 'Duration of readiness computations', buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2], registers: [register] });

function fmtYYYYMMDD(d: Date): string { return format(d, 'yyyyMMdd'); }

export async function readinessApiV1Routes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  async function computeForDate(userId: string, dt: Date) {
    const dateOnly = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
    const [sleep, hrv] = await Promise.all([
      prisma.sleepData.findUnique({ where: { userId_date: { userId, date: dateOnly } } }),
      prisma.hrvData.findUnique({ where: { userId_date: { userId, date: dateOnly } } })
    ]);
    const { score, incomplete, components } = computeReadiness(sleep?.durationMinutes ?? null, hrv?.lnRmssd ?? null);
    // upsert readiness_data
    await prisma.readinessData.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      update: { score, incomplete, components },
      create: { userId, date: dateOnly, score, incomplete, components }
    });
    return { userId, date: fmtYYYYMMDD(dateOnly), score, incomplete, components };
  }

  // GET /api/v1/readiness/:userId/latest
  fastify.get('/:userId/latest', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    const start = process.hrtime();
    const route = '/api/v1/readiness/:userId/latest';
    try {
      const { userId } = request.params;
      // latest date across sleep and hrv
      const [maxSleep, maxHrv] = await Promise.all([
        prisma.sleepData.findFirst({ where: { userId }, orderBy: { date: 'desc' }, select: { date: true } }),
        prisma.hrvData.findFirst({ where: { userId }, orderBy: { date: 'desc' }, select: { date: true } })
      ]);
      const latest = (maxSleep?.date && maxHrv?.date) ? (maxSleep.date > maxHrv.date ? maxSleep.date : maxHrv.date) : (maxSleep?.date || maxHrv?.date);
      if (!latest) {
        apiCounter.inc({ route, status: '204' });
        readinessCounter.inc({ result: 'incomplete' });
        return reply.code(204).send();
      }
      let result: any;
      await telemetry.tracer.startActiveSpan('readiness.compute', async (span: any) => {
        try {
          result = await computeForDate(userId, latest);
          span.setAttribute('user_id_hash', Buffer.from(userId).toString('hex').slice(0,8));
          span.setAttribute('date', result.date);
          span.setAttribute('result', result.incomplete ? 'incomplete' : 'success');
          span.setStatus({ code: 1 });
        } catch (e) { span.recordException(e); span.setStatus({ code: 2 }); throw e } finally { span.end() }
      });
      const dur = process.hrtime(start); readinessDuration.observe(dur[0] + dur[1]/1e9);
      readinessCounter.inc({ result: result.incomplete ? 'incomplete' : 'success' });
      apiCounter.inc({ route, status: '200' });
      return reply.code(200).send(result);
    } catch (err) {
      const dur = process.hrtime(start); readinessDuration.observe(dur[0] + dur[1]/1e9);
      readinessCounter.inc({ result: 'error' }); apiCounter.inc({ route, status: '500' });
      fastify.log.error({ err }, 'readiness.latest failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/readiness/:userId?days=7
  fastify.get('/:userId', async (request: FastifyRequest<{ Params: { userId: string }, Querystring: { days?: string } }>, reply: FastifyReply) => {
    const start = process.hrtime();
    const route = '/api/v1/readiness/:userId';
    try {
      const { userId } = request.params; const days = parseInt((request.query.days || '7'), 10) || 7;
      // Find last N dates from sleep or hrv
      const datesSleep = await prisma.sleepData.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: days, select: { date: true } });
      const datesHrv = await prisma.hrvData.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: days, select: { date: true } });
      const set = new Set<string>();
      datesSleep.forEach(d => set.add(d.date.toISOString().slice(0,10)));
      datesHrv.forEach(d => set.add(d.date.toISOString().slice(0,10)));
      const dates = Array.from(set).map(s => new Date(s + 'T00:00:00Z')).sort((a,b)=> b.getTime()-a.getTime()).slice(0, days);
      const items = [] as any[];
      for (const d of dates) {
        const res = await computeForDate(userId, d);
        items.push(res);
      }
      const dur = process.hrtime(start); readinessDuration.observe(dur[0] + dur[1]/1e9);
      apiCounter.inc({ route, status: '200' });
      return reply.code(200).send({ userId, items });
    } catch (err) {
      const dur = process.hrtime(start); readinessDuration.observe(dur[0] + dur[1]/1e9);
      readinessCounter.inc({ result: 'error' }); apiCounter.inc({ route, status: '500' });
      fastify.log.error({ err }, 'readiness.range failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
