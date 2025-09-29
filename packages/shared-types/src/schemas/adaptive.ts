import { z } from 'zod';

export const AdaptiveAdjustmentSchema = z.enum(['reduce', 'maintain', 'slight_increase', 'increase']);
export type AdaptiveAdjustment = z.infer<typeof AdaptiveAdjustmentSchema>;

export const AdaptiveSuggestionSchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adjustment: AdaptiveAdjustmentSchema,
  readinessScore: z.number().min(0).max(100).optional(),
  readinessBucket: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  reasons: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
});

export type AdaptiveSuggestion = z.infer<typeof AdaptiveSuggestionSchema>;
