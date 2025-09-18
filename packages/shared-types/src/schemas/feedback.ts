import { z } from 'zod';

export const RPEFeedbackSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  rpe: z.number().min(1).max(10),
  completionRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export const PerformanceMetricsSchema = z.object({
  sessionId: z.string(),
  totalVolume: z.number(),
  averageRPE: z.number().min(1).max(10),
  completionRate: z.number().min(0).max(100),
  recoveryTime: z.number(),
  sleepQuality: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  timestamp: z.string().datetime().optional(),
});

export const AdaptationsApplySchema = z.object({
  adjustments: z.array(z.object({
    type: z.string(),
    value: z.number().optional(),
    reason: z.string().optional(),
    confidence: z.number().optional(),
  }))
});

export type RPEFeedback = z.infer<typeof RPEFeedbackSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type AdaptationsApply = z.infer<typeof AdaptationsApplySchema>;