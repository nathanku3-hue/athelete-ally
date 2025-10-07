import { z } from 'zod';

// ============================================================================
// Fatigue Assessment Schemas
// ============================================================================

export const FatigueLevelSchema = z.enum(['low', 'moderate', 'high']);

export const FatigueAssessmentInputSchema = z.object({
  sleepQuality: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  muscleSoreness: z.number().min(1).max(10),
  energyLevel: z.number().min(1).max(10),
  motivation: z.number().min(1).max(10),
});

export const FatigueAssessmentResultSchema = z.object({
  success: z.boolean(),
  fatigueScore: z.number().min(0).max(10),
  level: FatigueLevelSchema,
  message: z.string(),
  timestamp: z.string(),
});

export const FatigueFactorSchema = z.object({
  type: z.enum(['sleep_quality', 'training_load', 'stress_level', 'recovery_time']),
  value: z.number(),
  impact: z.enum(['low', 'moderate', 'high']),
  description: z.string(),
});

export const FatigueStatusResponseSchema = z.object({
  level: FatigueLevelSchema,
  score: z.number().min(0).max(10),
  factors: z.array(FatigueFactorSchema),
  recommendations: z.array(z.string()),
  lastUpdated: z.string(),
  nextAssessment: z.string(),
});

// ============================================================================
// Season Schemas
// ============================================================================

export const SeasonSchema = z.enum(['offseason', 'preseason', 'inseason']);

export const SeasonOptionSchema = z.object({
  id: SeasonSchema,
  title: z.string(),
  description: z.string(),
});

// ============================================================================
// Feedback Schemas
// ============================================================================

export const FeedbackTypeSchema = z.enum(['bug', 'feature', 'improvement', 'general']);

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

// ============================================================================
// Onboarding Schemas
// ============================================================================

export const OnboardingDataSchema = z.object({
  userId: z.string(),
  purpose: z.enum(['general_fitness', 'sport_performance', 'body_recomposition', 'muscle_building', 'weight_loss', 'rehabilitation']).optional(),
  purposeDetails: z.string().optional(),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  season: SeasonSchema.nullable().optional(),
  competitionDate: z.string().optional(),
  availabilityDays: z.array(z.string()).optional(),
  timeSlots: z.array(z.string()).optional(),
  weeklyGoalDays: z.number().min(1).max(7).optional(),
  equipment: z.array(z.string()).optional(),
  fixedSchedules: z.array(z.object({
    day: z.string(),
    start: z.string(),
    end: z.string(),
  })).optional(),
  recoveryHabits: z.array(z.string()).optional(),
  onboardingStep: z.number().min(1).max(10).optional(),
  isOnboardingComplete: z.boolean().optional(),
  currentStep: z.number().optional(),
  isCompleted: z.boolean().optional(),
  submittedAt: z.number().optional(),
});

// ============================================================================
// API Request/Response Schemas
// ============================================================================

export const FatigueStatusPostRequestSchema = FatigueAssessmentInputSchema;
export const FatigueStatusPostResponseSchema = FatigueAssessmentResultSchema;
export const FatigueStatusGetResponseSchema = FatigueStatusResponseSchema;

export const OnboardingPostRequestSchema = OnboardingDataSchema;
export const OnboardingPostResponseSchema = z.object({
  success: z.boolean(),
  planId: z.string().optional(),
  jobId: z.string().optional(),
  error: z.string().optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type FatigueLevel = z.infer<typeof FatigueLevelSchema>;
export type FatigueAssessmentInput = z.infer<typeof FatigueAssessmentInputSchema>;
export type FatigueAssessmentResult = z.infer<typeof FatigueAssessmentResultSchema>;
export type FatigueFactor = z.infer<typeof FatigueFactorSchema>;
export type FatigueStatusResponse = z.infer<typeof FatigueStatusResponseSchema>;

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonOption = z.infer<typeof SeasonOptionSchema>;

export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;
export type FeedbackData = z.infer<typeof FeedbackDataSchema>;

export type OnboardingData = z.infer<typeof OnboardingDataSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateFatigueAssessmentInput(data: unknown): FatigueAssessmentInput {
  return FatigueAssessmentInputSchema.parse(data);
}

export function validateFatigueAssessmentResult(data: unknown): FatigueAssessmentResult {
  return FatigueAssessmentResultSchema.parse(data);
}

export function validateFatigueStatusResponse(data: unknown): FatigueStatusResponse {
  return FatigueStatusResponseSchema.parse(data);
}

export function validateSeason(data: unknown): Season {
  return SeasonSchema.parse(data);
}

export function validateFeedbackData(data: unknown): FeedbackData {
  return FeedbackDataSchema.parse(data);
}

export function validateOnboardingData(data: unknown): OnboardingData {
  return OnboardingDataSchema.parse(data);
}

// ============================================================================
// Safe Validation Functions (return validation result instead of throwing)
// ============================================================================

export function safeValidateFatigueAssessmentInput(data: unknown) {
  return FatigueAssessmentInputSchema.safeParse(data);
}

export function safeValidateFatigueAssessmentResult(data: unknown) {
  return FatigueAssessmentResultSchema.safeParse(data);
}

export function safeValidateFatigueStatusResponse(data: unknown) {
  return FatigueStatusResponseSchema.safeParse(data);
}

export function safeValidateSeason(data: unknown) {
  return SeasonSchema.safeParse(data);
}

export function safeValidateFeedbackData(data: unknown) {
  return FeedbackDataSchema.safeParse(data);
}

export function safeValidateOnboardingData(data: unknown) {
  return OnboardingDataSchema.safeParse(data);
}
