import { z } from 'zod';

export const WeeklyProgressSchema = z.object({
  weekNumber: z.number().int(),
  weeklyTrainingLoad: z.number(),
});

export const ProgressTrendsSchema = z.object({
  trainingLoadTrend: z.any(),
});

export const ProgressDataSchema = z.object({
  weeklyData: z.array(WeeklyProgressSchema).min(1),
  trends: ProgressTrendsSchema,
});

export type ProgressData = z.infer<typeof ProgressDataSchema>;
