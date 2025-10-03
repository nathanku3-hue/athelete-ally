import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../../prisma/generated/client';
import { format } from 'date-fns';
import { z } from 'zod';
import { getMetricsRegistry } from '@athlete-ally/shared';
import { Counter, Histogram } from 'prom-client';
import { computeReadiness } from '../utils/computeReadiness';

// Optional telemetry bootstrap (traces)
let bootstrapTelemetry: any; let telemetry: any;
try { ({ bootstrapTelemetry } = require('@athlete-ally/telemetry-bootstrap')); telemetry = bootstrapTelemetry({ serviceName: 'insights-engine' }); } catch { telemetry = { tracer: { startActiveSpan: async (_: string, fn: (s: any)=>Promise<void>) => fn({ setAttribute(){}, setStatus(){}, end(){}, recordException(){} }) } } }

const register = getMetricsRegistry();
const readinessCounter = new Counter({ name: 'readiness_compute_total', help: 'Total readiness computations', labelNames: ['result'], registers: [register] });
const apiCounter = new Counter({ name: 'api_requests_total', help: 'API requests total', labelNames: ['route','status'], registers: [register] });
const readinessDuration = new Histogram({ name: 'readiness_compute_duration_seconds', help: 'Duration of readiness computations', buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2], registers: [register] });

function fmtYYYYMMDD(d: Date): string { return format(d, 'yyyyMMdd'); }
function toUtcDateOnly(d: Date): Date { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); }

const paramsSchema = z.object({ userId: z.string().min(1).max(128) });
const queryDaysSchema = z.object({ days: z.string().transform((s)=>{ const n = parseInt(s, 10); return isNaN(n)? 7 : n; }).optional() });

export async function readinessApiV1Routes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  async function computeForDate(userId: string, dt: Date) {
    const dateOnly = toUtcDateOnly(dt);
    const [sleep, hrv, existing] = await Promise.all([
      prisma.sleepData.findUnique({ where: { userId_date: { userId, date: dateOnly } } }),
      prisma.hrvData.findUnique({ where: { userId_date: { userId, date: dateOnly } } }),
      prisma.readinessData.findUnique({ where: { userId_date: { userId, date: dateOnly } } })
    ]);

    const duration = sleep?.durationMinutes ?? null;
    const lnRmssd = hrv?.lnRmssd ?? null;
    const { score, incomplete: computedIncomplete, components } = computeReadiness(duration, lnRmssd);
    const inputsPresent = typeof duration === 'number' && typeof lnRmssd === 'number';

    // Preserve incomplete=true unless we have full inputs; never downgrade from false->true
    const newIncomplete = inputsPresent ? false : (existing?.incomplete ?? true);

    await prisma.readinessData.upsert({
      where: { userId_date: { userId, date: dateOnly } },
      update: { score, incomplete: newIncomplete, components: inputsPresent ? (components as any) : (existing?.components as any) },
      create: { userId, date: dateOnly, score, incomplete: newIncomplete, components: inputsPresent ? (components as any) : undefined }
    });

    const result = { userId, date: fmtYYYYMMDD(dateOnly), score, incomplete: newIncomplete } as any;
    if (inputsPresent) result.components = components;
    return { result, inputsPresent };
  }

  // GET /api/v1/readiness/:userId/latest (always 200; incomplete stub when inputs missing)
  fastify.get('/:userId/latest', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    const startHr = process.hrtime();
    const route = '/api/v1/readiness/:userId/latest';
    try {
      const parseParams = paramsSchema.safeParse(request.params);
      if (!parseParams.success) { apiCounter.inc({ route, status: '400' }); return reply.code(400).send({ error: 'Invalid userId' }); }
      const { userId } = parseParams.data;

      // Find latest date across sleep and hrv
      const [maxSleep, maxHrv] = await Promise.all([
        prisma.sleepData.findFirst({ where: { userId }, orderBy: { date: 'desc' }, select: { date: true } }),
        prisma.hrvData.findFirst({ where: { userId }, orderBy: { date: 'desc' }, select: { date: true } })
      ]);
      const latest = (maxSleep?.date && maxHrv?.date) ? (maxSleep.date > maxHrv.date ? maxSleep.date : maxHrv.date) : (maxSleep?.date || maxHrv?.date);
      // If no dates, synthesize today stub marked incomplete
      const target = latest ? latest : toUtcDateOnly(new Date());

      let payload: any; let inputsPresent = false;
      await telemetry.tracer.startActiveSpan('readiness.compute', async (span: any) => {
        try {
          const res = await computeForDate(userId, target);
          payload = res.result; inputsPresent = res.inputsPresent;
          span.setAttribute('user_id_hash', Buffer.from(userId).toString('hex').slice(0,8));
          span.setAttribute('date', payload.date);
          span.setAttribute('result', inputsPresent ? 'success' : 'incomplete');
          span.setStatus({ code: 1 });
        } catch (e) { span.recordException(e); span.setStatus({ code: 2 }); throw e } finally { span.end(); }
      });

      const d = process.hrtime(startHr); readinessDuration.observe(d[0] + d[1]/1e9);
      readinessCounter.inc({ result: inputsPresent ? 'success' : 'incomplete' });
      apiCounter.inc({ route, status: '200' });
      return reply.code(200).send(payload);
    } catch (err) {
      const d = process.hrtime(startHr); readinessDuration.observe(d[0] + d[1]/1e9);
      readinessCounter.inc({ result: 'error' }); apiCounter.inc({ route, status: '500' });
      (request as any).log?.error?.({ err }, 'readiness.latest failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/readiness/:userId?days=7 (returns array, desc by date)
  fastify.get('/:userId', async (request: FastifyRequest<{ Params: { userId: string }, Querystring: { days?: string } }>, reply: FastifyReply) => {
    const startHr = process.hrtime();
    const route = '/api/v1/readiness/:userId';
    try {
      const pOk = paramsSchema.safeParse(request.params); if (!pOk.success) { apiCounter.inc({ route, status: '400' }); return reply.code(400).send({ error: 'Invalid userId' }); }
      const qOk = queryDaysSchema.safeParse(request.query); if (!qOk.success) { apiCounter.inc({ route, status: '400' }); return reply.code(400).send({ error: 'Invalid days' }); }
      const userId = pOk.data.userId; let days = qOk.data.days ?? 7; if (days < 1) days = 1; if (days > 30) days = 30;

      // Collect candidate dates from sleep/hrv
      const [datesSleep, datesHrv] = await Promise.all([
        prisma.sleepData.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: days, select: { date: true } }),
        prisma.hrvData.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: days, select: { date: true } })
      ]);
      const set = new Set<string>();
      datesSleep.forEach(d => set.add(d.date.toISOString().slice(0,10)));
      datesHrv.forEach(d => set.add(d.date.toISOString().slice(0,10)));
      const dates = Array.from(set).map(s => new Date(s + 'T00:00:00Z')).sort((a,b)=> b.getTime()-a.getTime()).slice(0, days);

      const items: any[] = [];
      for (const d of dates) {
        const res = await computeForDate(userId, d);
        items.push(res.result);
      }

      const dHr = process.hrtime(startHr); readinessDuration.observe(dHr[0] + dHr[1]/1e9);
      apiCounter.inc({ route, status: '200' });
      return reply.code(200).send(items);
    } catch (err) {
      const d = process.hrtime(startHr); readinessDuration.observe(d[0] + d[1]/1e9);
      readinessCounter.inc({ result: 'error' }); apiCounter.inc({ route, status: '500' });
      (request as any).log?.error?.({ err }, 'readiness.range failed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

