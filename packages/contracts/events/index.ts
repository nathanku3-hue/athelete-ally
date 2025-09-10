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

// Event topics
export const EVENT_TOPICS = {
  ONBOARDING_COMPLETED: 'athlete-ally.onboarding.completed',
  PLAN_GENERATION_REQUESTED: 'athlete-ally.plans.generation-requested',
  PLAN_GENERATED: 'athlete-ally.plans.generated',
  PLAN_GENERATION_FAILED: 'athlete-ally.plans.generation-failed',
} as const;

// Event schemas for validation
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