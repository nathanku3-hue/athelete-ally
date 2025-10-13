import { z } from 'zod';

const muscleNameSchema = z.string().trim().min(1).max(64);
const tagSchema = z.string().trim().min(1).max(48);
const equipmentSchema = z.string().trim().min(1).max(64);

const movementInstructionsObject = z.object({
  setup: z.string().trim().min(1).max(2000).optional(),
  execution: z.array(z.string().trim().min(1).max(1000)).max(20).optional(),
  cues: z.array(z.string().trim().min(1).max(240)).max(15).optional(),
  commonMistakes: z.array(z.string().trim().min(1).max(240)).max(15).optional(),
  breathing: z.array(z.string().trim().min(1).max(240)).max(10).optional(),
  coachingTips: z.array(z.string().trim().min(1).max(240)).max(15).optional(),
}).strict();

export const movementInstructionsSchema = movementInstructionsObject.optional();

export const movementDraftSchema = z.object({
  name: z.string().trim().min(1).max(140),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  classification: z.string().trim().min(1).max(60),
  equipment: z.array(equipmentSchema).max(12).optional(),
  primaryMuscles: z.array(muscleNameSchema).min(1).max(12),
  secondaryMuscles: z.array(muscleNameSchema).max(12).optional(),
  recommendedRpe: z.number().min(1).max(10).optional(),
  progressionIds: z.array(z.string().trim().min(1)).max(10).optional(),
  regressionIds: z.array(z.string().trim().min(1)).max(10).optional(),
  tags: z.array(tagSchema).max(24).optional(),
  instructions: movementInstructionsObject.nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const movementDraftUpdateSchema = movementDraftSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'update payload must include at least one field' },
);

export const movementStatusTransitionSchema = z.object({
  nextStatus: z.enum(['DRAFT', 'READY_FOR_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
  notes: z.string().trim().max(1000).optional(),
});

export type MovementDraftInput = z.infer<typeof movementDraftSchema>;
export type MovementDraftUpdateInput = z.infer<typeof movementDraftUpdateSchema>;
