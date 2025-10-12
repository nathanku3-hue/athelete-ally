import { z } from 'zod';

// Feedback type enum
export const FeedbackTypeSchema = z.enum(['bug', 'feature', 'improvement', 'general']);
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;

// Feedback data schema
export const FeedbackDataSchema = z.object({
  type: FeedbackTypeSchema,
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  userEmail: z.string().email().optional(),
  userId: z.string().optional(),
});
export type FeedbackData = z.infer<typeof FeedbackDataSchema>;

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