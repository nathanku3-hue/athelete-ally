// Event definitions for the athlete-ally system

export interface OnboardingCompletedEvent {
  eventId: string;
  userId: string;
  timestamp: number;
  // Step 1: Training Purpose
  purpose?: 'general_fitness' | 'sport_performance' | 'muscle_building' | 'weight_loss' | 'rehabilitation';
  purposeDetails?: string;
  
  // Step 2: Proficiency Level
  proficiency?: 'beginner' | 'intermediate' | 'advanced';
  
  // Step 3: Season and Goals
  season?: 'offseason' | 'preseason' | 'inseason';
  competitionDate?: string;
  
  // Step 4: Availability
  availabilityDays?: number;
  weeklyGoalDays?: number;
  
  // Step 5: Equipment and scheduling
  equipment: string[];
  fixedSchedules?: Array<{ day: string; start: string; end: string }>;
  
  // Step 6: Recovery habits
  recoveryHabits?: string[];
  
  // Onboarding status
  onboardingStep?: number;
  isOnboardingComplete?: boolean;
}

export interface PlanGeneratedEvent {
  eventId: string;
  userId: string;
  planId: string;
  timestamp: number;
  planName: string;
  status: 'generating' | 'completed' | 'failed';
  version: number;
}

export interface PlanGenerationRequestedEvent {
  eventId: string;
  userId: string;
  timestamp: number;
  jobId: string;
  // Plan generation parameters
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  season: 'offseason' | 'preseason' | 'inseason';
  availabilityDays: number;
  weeklyGoalDays: number;
  equipment: string[];
  purpose?: 'general_fitness' | 'sport_performance' | 'muscle_building' | 'weight_loss' | 'rehabilitation';
  competitionDate?: string;
  fixedSchedules?: Array<{ day: string; start: string; end: string }>;
  recoveryHabits?: string[];
}

export interface PlanGenerationFailedEvent {
  eventId: string;
  userId: string;
  timestamp: number;
  jobId: string;
  error: string;
  retryCount: number;
}

export interface HRVRawReceivedEvent {
  eventId: string;
  payload: {
    userId: string;
    date: string; // 'YYYY-MM-DD'
    rMSSD: number; // >= 0
    capturedAt: string; // ISO datetime
    raw?: Record<string, unknown>;
  };
}

export interface HRVNormalizedStoredEvent {
  record: {
    userId: string;
    date: string; // 'YYYY-MM-DD'
    rMSSD: number;
    lnRMSSD: number;
    readinessScore: number; // 0..100
    vendor: 'oura' | 'whoop' | 'unknown';
    capturedAt: string; // ISO datetime
  };
}

// Event topics
export const EVENT_TOPICS = {
  ONBOARDING_COMPLETED: 'athlete-ally.onboarding.completed',
  PLAN_GENERATION_REQUESTED: 'athlete-ally.plans.generation-requested',
  PLAN_GENERATED: 'athlete-ally.plans.generated',
  PLAN_GENERATION_FAILED: 'athlete-ally.plans.generation-failed',
  HRV_RAW_RECEIVED: 'athlete-ally.hrv.raw-received',
  HRV_NORMALIZED_STORED: 'athlete-ally.hrv.normalized-stored',
} as const;

// Export schemas from dedicated file
export * from './schemas';