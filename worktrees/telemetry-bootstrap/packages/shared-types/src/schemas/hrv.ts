import { z } from 'zod';

// HRV Readiness Driver Schema
export const ReadinessDriverSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
});

// Readiness Today Response Schema
export const ReadinessTodaySchema = z.object({
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readinessScore: z.number().min(0).max(100),
  drivers: z.array(ReadinessDriverSchema),
  timestamp: z.string().datetime(),
});

// Readiness Range Item Schema
export const ReadinessRangeItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readinessScore: z.number().min(0).max(100),
  drivers: z.array(ReadinessDriverSchema).optional(),
});

// Readiness Range Response Schema
export const ReadinessRangeSchema = z.array(ReadinessRangeItemSchema);

// Type exports
export type ReadinessDriver = z.infer<typeof ReadinessDriverSchema>;
export type ReadinessToday = z.infer<typeof ReadinessTodaySchema>;
export type ReadinessRangeItem = z.infer<typeof ReadinessRangeItemSchema>;
export type ReadinessRange = z.infer<typeof ReadinessRangeSchema>;
