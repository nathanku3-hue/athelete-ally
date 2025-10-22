import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { TrainingPlan } from '../llm.js';
import {
  TimeCrunchPreviewError,
  generateTimeCrunchPreview
} from '../time-crunch/service.js';
import { trackEvent } from '../telemetry.js';
import { CompressionOutcome, SessionSegment } from '../time-crunch/types.js';
import { isFeatureEnabled } from '../feature-flags/index.js';

const TimeCrunchPreviewRequestSchema = z.object({
  planId: z.string().min(1),
  targetMinutes: z.number().int().min(15).max(180)
});

export async function timeCrunchRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/api/v1/time-crunch/preview',
    async (request, reply) => {
      // Validate request body
      const parsed = TimeCrunchPreviewRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'invalid_request',
          details: parsed.error.issues,
        });
      }
      const { planId, targetMinutes } = parsed.data;

      // Check if Time Crunch Mode is enabled
      const isTimeCrunchEnabled = await isFeatureEnabled('feature.stream5_time_crunch_mode', false);
      if (!isTimeCrunchEnabled) {
        return reply.status(404).send({ error: 'feature_not_available' });
      }

      const user = (request as unknown as { user?: { userId?: string } }).user;
      if (!user?.userId) {
        return reply.status(401).send({ error: 'unauthorized' });
      }

      const planRecord = await prisma.plan.findUnique({
        where: { id: planId },
        select: {
          id: true,
          userId: true,
          content: true
        }
      });

      if (!planRecord) {
        return reply.status(404).send({ error: 'plan_not_found' });
      }

      if (planRecord.userId !== user.userId) {
        return reply.status(403).send({ error: 'forbidden' });
      }

      const planContent = planRecord.content as TrainingPlan | null;
      if (!planContent || typeof planContent !== 'object') {
        return reply.status(422).send({ error: 'plan_missing_content' });
      }

      trackEvent('stream5.time_crunch_preview_requested', {
        planId: planRecord.id,
        targetMinutes,
        compressionStrategy: 'pending',
        userId: user.userId,
        source: 'planning-engine'
      });

      try {
        const preview = generateTimeCrunchPreview(planContent, targetMinutes);
        const compressionStrategy = deriveCompressionStrategy(preview.outcome);

        trackEvent('stream5.time_crunch_preview_succeeded', {
          planId: planRecord.id,
          targetMinutes,
          compressionStrategy,
          meetsTimeConstraint: preview.outcome.meetsTimeConstraint,
          userId: user.userId,
          source: 'planning-engine'
        });

        return reply.send({
          planId: planRecord.id,
          targetMinutes,
          originalDurationSeconds: preview.input.originalDurationSeconds,
          compressedDurationSeconds: preview.outcome.compressedDurationSeconds,
          meetsTimeConstraint: preview.outcome.meetsTimeConstraint,
          sessions: preview.outcome.sessions
        });
      } catch (error) {
        if (error instanceof TimeCrunchPreviewError) {
          trackEvent('stream5.time_crunch_preview_fallback', {
            planId: planRecord.id,
            targetMinutes,
            compressionStrategy: 'none',
            reason: error.code,
            userId: user.userId,
            source: 'planning-engine'
          });
          return reply.status(422).send({ error: error.code });
        }
        request.log.error({ err: error }, 'Time Crunch preview failed');
        trackEvent('stream5.time_crunch_preview_fallback', {
          planId: planRecord.id,
          targetMinutes,
          compressionStrategy: 'none',
          reason: 'internal_error',
          userId: user.userId,
          source: 'planning-engine'
        });
        return reply.status(500).send({ error: 'preview_failed' });
      }
    }
  );
}

const deriveCompressionStrategy = (outcome: CompressionOutcome): string => {
  const allSegments: SessionSegment[] = outcome.sessions.flatMap((session) => session.segments ?? []);
  const hasBlock = allSegments.some((segment) => segment.kind === 'accessory_block');
  const hasSuperset = allSegments.some((segment) => segment.kind === 'accessory_superset');
  const hasAccessorySingle = allSegments.some((segment) => segment.kind === 'accessory_single');

  if (hasBlock && hasSuperset) {
    return 'core_plus_block_and_superset';
  }
  if (hasBlock) {
    return 'core_plus_block';
  }
  if (hasSuperset) {
    return 'core_plus_superset';
  }
  if (hasAccessorySingle) {
    return 'core_plus_accessory';
  }
  return 'core_only';
};
