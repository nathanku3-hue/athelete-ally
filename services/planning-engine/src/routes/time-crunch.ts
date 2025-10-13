import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Counter, Histogram } from 'prom-client';
import { createLogger } from '@athlete-ally/logger';
import nodeAdapter from '@athlete-ally/logger/server';

import { prisma } from '../db.js';
import { isFeatureEnabled } from '../feature-flags/index.js';
import { compressSession, type SessionWithExercises } from '../time-crunch/compressor.js';
import { Prisma } from '../../prisma/generated/client/index.js';

const log = createLogger(nodeAdapter, { module: 'time-crunch', service: 'planning-engine' });

const timeCrunchRequests = new Counter({
  name: 'planning_time_crunch_requests_total',
  help: 'Count of Time Crunch Mode requests',
  labelNames: ['result', 'source'],
});

const timeCrunchDuration = new Histogram({
  name: 'planning_time_crunch_duration_seconds',
  help: 'Duration of Time Crunch compression flow',
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
});

function normalizeSourceLabel(source?: string | null): string {
  if (!source) {
    return 'unknown';
  }

  const normalized = source.toLowerCase();
  return /^[a-z0-9_-]+$/.test(normalized) ? normalized : 'unknown';
}

function trackTimeCrunchEvent(event: string, payload: Record<string, unknown>): void {
  log.info('time crunch telemetry', {
    analyticsEvent: event,
    channel: 'segment',
    ...payload,
  });
}

const TimeCrunchRequestSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  targetMinutes: z.number().int().min(10).max(180),
  source: z.enum(['cta', 'auto', 'manual']).optional(),
  reason: z.string().max(240).optional(),
});

type TimeCrunchRequest = z.infer<typeof TimeCrunchRequestSchema>;

function serializeSession(session: SessionWithExercises) {
  return {
    sessionId: session.id,
    dayOfWeek: session.dayOfWeek,
    name: session.name,
    duration: session.duration,
    exercises: session.exercises
      .map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        notes: exercise.notes,
        order: exercise.order,
      }))
      .sort((a, b) => a.order - b.order),
    isTimeCrunchActive: session.isTimeCrunchActive,
    timeCrunchMinutes: session.timeCrunchMinutes,
    timeCrunchAppliedAt: session.timeCrunchAppliedAt,
    compressedPlan: session.compressedPlan,
    compressionDiff: session.compressionDiff,
    compressionSummary: session.compressionSummary,
  };
}

async function fetchSession(planId: string, sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      microcycle: {
        include: {
          plan: { select: { id: true, userId: true } },
        },
      },
    },
  });

  if (!session || session.microcycle.planId !== planId) {
    return null;
  }

  return session as SessionWithExercises & {
    microcycle: SessionWithExercises['microcycle'] & { plan: { id: string; userId: string } };
  };
}

export async function timeCrunchRoutes(fastify: FastifyInstance) {
  fastify.post<{
    Params: { planId: string };
    Body: TimeCrunchRequest;
  }>('/api/v1/plans/:planId/compress', async (request, reply) => {
    const parseResult = TimeCrunchRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        status: 'invalid_request',
        error: parseResult.error.flatten(),
      });
    }

    const { sessionId, userId, targetMinutes, source, reason } = parseResult.data;
    const { planId } = request.params;

    const sourceLabel = normalizeSourceLabel(source);
    const startTime = process.hrtime.bigint();
    const recordMetric = (result: string) => {
      const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000_000;
      timeCrunchRequests.inc({ result, source: sourceLabel });
      timeCrunchDuration.observe(duration);
    };

    const session = await fetchSession(planId, sessionId);

    if (!session) {
      log.warn('time crunch requested for missing session', { planId, sessionId });
      trackTimeCrunchEvent('time_crunch_abandoned', {
        planId,
        sessionId,
        userId,
        reason: 'not_found',
        source: sourceLabel,
      });
      recordMetric('not_found');
      return reply.status(404).send({
        status: 'not_found',
        message: 'Plan or session not found',
      });
    }

    if (session.microcycle.plan.userId !== userId) {
      log.warn('user mismatch for time crunch request', { planId, sessionId, userId });
      trackTimeCrunchEvent('time_crunch_abandoned', {
        planId,
        sessionId,
        userId,
        reason: 'forbidden',
        source: sourceLabel,
      });
      recordMetric('forbidden');
      return reply.status(403).send({
        status: 'forbidden',
        message: 'User is not allowed to modify this plan',
      });
    }

    trackTimeCrunchEvent('time_crunch_requested', {
      planId,
      sessionId,
      userId,
      targetMinutes,
      source: sourceLabel,
    });

    const isEnabled = await isFeatureEnabled('feature.v1_planning_time_crunch_ai', false);

    if (!isEnabled) {
      trackTimeCrunchEvent('time_crunch_abandoned', {
        planId,
        sessionId,
        userId,
        reason: 'flag_disabled',
        source: sourceLabel,
      });
      recordMetric('disabled');
      if (session.isTimeCrunchActive) {
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            isTimeCrunchActive: false,
            timeCrunchMinutes: null,
            timeCrunchAppliedAt: null,
            compressedPlan: Prisma.JsonNull,
            compressionDiff: Prisma.JsonNull,
            compressionSummary: null,
          },
        });
      }

      return reply.send({
        status: 'disabled',
        flagEnabled: false,
        planId,
        sessionId,
        targetMinutes,
        originalSession: serializeSession(session),
        compressedSession: null,
        diff: null,
        summary: 'Time Crunch Mode is disabled.',
      });
    }

    try {
      const compression = compressSession(session, targetMinutes);
      const timestamp = new Date();

      await prisma.session.update({
        where: { id: sessionId },
        data: {
          isTimeCrunchActive: compression.diff.totalMinutesSaved > 0,
          timeCrunchMinutes: Math.round(compression.diff.targetDuration),
          timeCrunchAppliedAt: timestamp,
          compressedPlan: compression.compressedSession as Prisma.InputJsonValue,
          compressionDiff: compression.diff as Prisma.InputJsonValue,
          compressionSummary: compression.summary,
        },
      });

      const resultLabel = compression.diff.totalMinutesSaved > 0 ? 'compressed' : 'unchanged';
      recordMetric(resultLabel);

      log.info('time crunch compression applied', {
        planId,
        sessionId,
        targetMinutes,
        achievedDuration: compression.diff.achievedDuration,
        totalMinutesSaved: compression.diff.totalMinutesSaved,
        removedExercises: compression.diff.removedExercises.length,
        reducedExercises: compression.diff.reducedExercises.length,
        source: sourceLabel,
      });

      trackTimeCrunchEvent('time_crunch_success', {
        planId,
        sessionId,
        userId,
        targetMinutes,
        achievedMinutes: compression.diff.achievedDuration,
        totalMinutesSaved: compression.diff.totalMinutesSaved,
        source: sourceLabel,
      });

      trackTimeCrunchEvent('time_crunch_completed', {
        planId,
        sessionId,
        userId,
        appliedAt: timestamp.toISOString(),
        source: sourceLabel,
      });

      return reply.send({
        status: compression.diff.totalMinutesSaved > 0 ? 'compressed' : 'unchanged',
        flagEnabled: true,
        planId,
        sessionId,
        targetMinutes: compression.diff.targetDuration,
        achievedMinutes: compression.diff.achievedDuration,
        totalMinutesSaved: compression.diff.totalMinutesSaved,
        removedExercises: compression.diff.removedExercises,
        reducedExercises: compression.diff.reducedExercises,
        summary: compression.summary,
        compressedSession: compression.compressedSession,
        originalSession: serializeSession(session),
        context: {
          userId,
          source: sourceLabel,
          reason,
          appliedAt: timestamp.toISOString(),
        },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      log.error('time crunch compression failed', {
        planId,
        sessionId,
        userId,
        source: sourceLabel,
        error: err.message,
      });
      trackTimeCrunchEvent('time_crunch_abandoned', {
        planId,
        sessionId,
        userId,
        source: sourceLabel,
        reason: 'error',
        error: err.message,
      });
      recordMetric('failed');
      return reply.status(500).send({
        status: 'error',
        message: 'Failed to compress session',
      });
    }
  });

  fastify.get<{
    Params: { planId: string; sessionId: string };
    Querystring: { userId?: string };
  }>('/api/v1/plans/:planId/sessions/:sessionId/time-crunch', async (request, reply) => {
    const { planId, sessionId } = request.params;
    const { userId } = request.query;

    const session = await fetchSession(planId, sessionId);

    if (!session) {
      return reply.status(404).send({
        status: 'not_found',
        message: 'Plan or session not found',
      });
    }

    if (userId && session.microcycle.plan.userId !== userId) {
      return reply.status(403).send({
        status: 'forbidden',
        message: 'User is not allowed to access this plan',
      });
    }

    const flagEnabled = await isFeatureEnabled('feature.v1_planning_time_crunch_ai', false);

    return reply.send({
      flagEnabled,
      planId,
      sessionId,
      timeCrunch: {
        isActive: session.isTimeCrunchActive,
        minutes: session.timeCrunchMinutes,
        appliedAt: session.timeCrunchAppliedAt,
        summary: session.compressionSummary,
        diff: session.compressionDiff,
        compressedSession: session.compressedPlan,
      },
      session: serializeSession(session),
    });
  });
}
