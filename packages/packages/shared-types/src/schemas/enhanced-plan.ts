import { z } from 'zod';

export const TrainingIntentSchema = z.object({
  primaryGoal: z.enum(['strength','endurance','flexibility','weight_loss','muscle_gain','sports_specific']),
  secondaryGoals: z.array(z.string()),
  experienceLevel: z.enum(['beginner','intermediate','advanced','expert']),
  timeConstraints: z.object({
    availableDays: z.number().min(1).max(7),
    sessionDuration: z.number().min(15).max(300),
    preferredTimes: z.array(z.string()),
  }),
  equipment: z.array(z.string()),
  limitations: z.array(z.string()),
  preferences: z.object({
    intensity: z.enum(['low','medium','high']),
    style: z.enum(['traditional','functional','hiit','yoga','pilates']),
    progression: z.enum(['linear','undulating','block']),
  }),
});

export const EnhancedPlanGenerationRequestSchema = z.object({
  userId: z.string().min(1),
  trainingIntent: TrainingIntentSchema,
  currentFitnessLevel: z.object({
    strength: z.number().min(1).max(10),
    endurance: z.number().min(1).max(10),
    flexibility: z.number().min(1).max(10),
    mobility: z.number().min(1).max(10),
  }),
  injuryHistory: z.array(z.string()),
  performanceGoals: z.object({
    shortTerm: z.array(z.string()),
    mediumTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
  feedbackHistory: z.array(z.object({
    sessionId: z.string(),
    rpe: z.number().min(1).max(10),
    completionRate: z.number().min(0).max(100),
    notes: z.string().optional(),
  })),
});

export type EnhancedPlanGenerationRequest = z.infer<typeof EnhancedPlanGenerationRequestSchema>;
