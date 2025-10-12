import { z } from 'zod';

// Base fatigue level enum
export const FatigueLevelSchema = z.enum(['low', 'moderate', 'high']);
export type FatigueLevel = z.infer<typeof FatigueLevelSchema>;

// Fatigue assessment input schema
export const FatigueAssessmentInputSchema = z.object({
  sleepQuality: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  muscleSoreness: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  motivation: z.number().min(1).max(10),
});
export type FatigueAssessmentInput = z.infer<typeof FatigueAssessmentInputSchema>;

// Fatigue assessment result schema
export const FatigueAssessmentResultSchema = z.object({
  success: z.boolean(),
  fatigueScore: z.number().min(0).max(10),
  level: FatigueLevelSchema,
  message: z.string(),
  timestamp: z.string(),
});
export type FatigueAssessmentResult = z.infer<typeof FatigueAssessmentResultSchema>;

// Fatigue factor schema
export const FatigueFactorSchema = z.object({
  type: z.enum(['sleep_quality', 'training_load', 'stress_level', 'recovery_time']),
  value: z.number(),
  impact: z.enum(['low', 'moderate', 'high']),
  description: z.string(),
});
export type FatigueFactor = z.infer<typeof FatigueFactorSchema>;

// Fatigue status response schema
export const FatigueStatusResponseSchema = z.object({
  level: FatigueLevelSchema,
  score: z.number().min(0).max(10),
  factors: z.array(FatigueFactorSchema),
  recommendations: z.array(z.string()),
  lastUpdated: z.string(),
  nextAssessment: z.string(),
});
export type FatigueStatusResponse = z.infer<typeof FatigueStatusResponseSchema>;

// Validation functions
export function validateFatigueAssessmentInput(data: unknown): FatigueAssessmentInput {
  return FatigueAssessmentInputSchema.parse(data);
}

export function validateFatigueAssessmentResult(data: unknown): FatigueAssessmentResult {
  return FatigueAssessmentResultSchema.parse(data);
}

export function validateFatigueStatusResponse(data: unknown): FatigueStatusResponse {
  return FatigueStatusResponseSchema.parse(data);
}

// Safe validation functions
export function safeValidateFatigueAssessmentInput(data: unknown) {
  return FatigueAssessmentInputSchema.safeParse(data);
}

export function safeValidateFatigueAssessmentResult(data: unknown) {
  return FatigueAssessmentResultSchema.safeParse(data);
}

export function safeValidateFatigueStatusResponse(data: unknown) {
  return FatigueStatusResponseSchema.safeParse(data);
}
