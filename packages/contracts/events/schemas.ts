// Event schemas for validation - Single source of truth
// This file contains all event schemas used by the event-bus package

export const OnboardingCompletedSchema = {
  type: 'object',
  required: ['eventId', 'userId', 'timestamp', 'equipment'],
  properties: {
    eventId: { type: 'string' },
    userId: { type: 'string' },
    timestamp: { type: 'number' },
    // Step 1: Training Purpose
    purpose: { 
      type: 'string', 
      enum: ['general_fitness', 'sport_performance', 'muscle_building', 'weight_loss', 'rehabilitation'] 
    },
    purposeDetails: { type: 'string' },
    
    // Step 2: Proficiency Level
    proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    
    // Step 3: Season and Goals
    season: { type: 'string', enum: ['offseason', 'preseason', 'inseason'] },
    competitionDate: { type: 'string', format: 'date-time' },
    
    // Step 4: Availability
    availabilityDays: { type: 'number', minimum: 1, maximum: 7 },
    weeklyGoalDays: { type: 'number', minimum: 1, maximum: 7 },
    
    // Step 5: Equipment and scheduling
    equipment: { type: 'array', items: { type: 'string' } },
    fixedSchedules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string' },
          start: { type: 'string' },
          end: { type: 'string' }
        }
      }
    },
    
    // Step 6: Recovery habits
    recoveryHabits: { type: 'array', items: { type: 'string' } },
    
    // Onboarding status
    onboardingStep: { type: 'number', minimum: 1, maximum: 6 },
    isOnboardingComplete: { type: 'boolean' }
  }
} as const;

export const PlanGenerationRequestedSchema = {
  type: 'object',
  required: ['eventId', 'userId', 'timestamp', 'jobId', 'proficiency', 'season', 'availabilityDays', 'weeklyGoalDays', 'equipment'],
  properties: {
    eventId: { type: 'string' },
    userId: { type: 'string' },
    timestamp: { type: 'number' },
    jobId: { type: 'string' },
    // Plan generation parameters
    proficiency: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    season: { type: 'string', enum: ['offseason', 'preseason', 'inseason'] },
    availabilityDays: { type: 'number', minimum: 1, maximum: 7 },
    weeklyGoalDays: { type: 'number', minimum: 1, maximum: 7 },
    equipment: { type: 'array', items: { type: 'string' } },
    purpose: { 
      type: 'string', 
      enum: ['general_fitness', 'sport_performance', 'muscle_building', 'weight_loss', 'rehabilitation'] 
    },
    competitionDate: { type: 'string', format: 'date-time' },
    fixedSchedules: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string' },
          start: { type: 'string' },
          end: { type: 'string' }
        }
      }
    },
    recoveryHabits: { type: 'array', items: { type: 'string' } }
  }
} as const;

export const PlanGeneratedSchema = {
  type: 'object',
  required: ['eventId', 'userId', 'planId', 'timestamp', 'planName', 'status', 'version'],
  properties: {
    eventId: { type: 'string' },
    userId: { type: 'string' },
    planId: { type: 'string' },
    timestamp: { type: 'number' },
    planName: { type: 'string' },
    status: { type: 'string', enum: ['generating', 'completed', 'failed'] },
    version: { type: 'number', minimum: 1 }
  }
} as const;

export const PlanGenerationFailedSchema = {
  type: 'object',
  required: ['eventId', 'userId', 'jobId', 'timestamp', 'error', 'retryCount'],
  properties: {
    eventId: { type: 'string' },
    userId: { type: 'string' },
    jobId: { type: 'string' },
    timestamp: { type: 'number' },
    error: { type: 'string' },
    retryCount: { type: 'number', minimum: 0 }
  }
} as const;

export const HRVRawReceivedSchema = {
  type: 'object',
  required: ['payload'],
  properties: {
    payload: {
      type: 'object',
      required: ['userId', 'date', 'rMSSD', 'capturedAt'],
      properties: {
        userId: { type: 'string', minLength: 1 },
        date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        rMSSD: { type: 'number', minimum: 0 },
        capturedAt: { type: 'string', format: 'date-time' },
        raw: { type: 'object' }
      }
    }
  }
} as const;

export const HRVNormalizedStoredSchema = {
  type: 'object',
  required: ['record'],
  properties: {
    record: {
      type: 'object',
      required: ['userId', 'date', 'rMSSD', 'lnRMSSD', 'readinessScore', 'vendor', 'capturedAt'],
      properties: {
        userId: { type: 'string', minLength: 1 },
        date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        rMSSD: { type: 'number', minimum: 0 },
        lnRMSSD: { type: 'number' },
        readinessScore: { type: 'number', minimum: 0, maximum: 100 },
        vendor: { type: 'string', enum: ['oura', 'whoop', 'unknown'] },
        capturedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
} as const;

export const SleepRawReceivedSchema = {
  type: 'object',
  required: ['payload'],
  properties: {
    payload: {
      type: 'object',
      required: ['userId', 'date', 'durationMinutes'],
      properties: {
        userId: { type: 'string', minLength: 1 },
        date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        durationMinutes: { type: 'number', minimum: 0 },
        capturedAt: { type: 'string', format: 'date-time' },
        raw: { type: 'object' }
      }
    }
  }
} as const;

export const SleepNormalizedStoredSchema = {
  type: 'object',
  required: ['record'],
  properties: {
    record: {
      type: 'object',
      required: ['userId', 'date', 'durationMinutes', 'vendor', 'capturedAt'],
      properties: {
        userId: { type: 'string', minLength: 1 },
        date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        durationMinutes: { type: 'number', minimum: 0 },
        qualityScore: { type: 'number', minimum: 0, maximum: 100 },
        vendor: { type: 'string', enum: ['oura', 'whoop', 'unknown'] },
        capturedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
} as const;

// Schema registry for easy access
export const EventSchemas = {
  'onboarding_completed': OnboardingCompletedSchema,
  'plan_generation_requested': PlanGenerationRequestedSchema,
  'plan_generated': PlanGeneratedSchema,
  'plan_generation_failed': PlanGenerationFailedSchema,
  'hrv_raw_received': HRVRawReceivedSchema,
  'hrv_normalized_stored': HRVNormalizedStoredSchema,
  'sleep_raw_received': SleepRawReceivedSchema,
  'sleep_normalized_stored': SleepNormalizedStoredSchema
} as const;

// Type for schema keys
export type EventSchemaKey = keyof typeof EventSchemas;
