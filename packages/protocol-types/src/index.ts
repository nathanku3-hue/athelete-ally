// Protocol Engine TypeScript Types
// Core types for Protocol and Block concepts

export interface Protocol {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Protocol identification
  name: string;
  version: string;
  description?: string;
  
  // Protocol metadata
  category: ProtocolCategory;
  difficulty: DifficultyLevel;
  duration?: number; // weeks
  frequency?: number; // sessions per week
  
  // Protocol configuration
  isActive: boolean;
  isPublic: boolean;
  createdBy?: string;
  
  // Protocol content
  overview?: string;
  principles: string[];
  requirements: string[];
  
  // Relations
  blocks?: Block[];
  templates?: ProtocolTemplate[];
  executions?: ProtocolExecution[];
}

export interface Block {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Block identification
  protocolId: string;
  protocol?: Protocol;
  
  name: string;
  description?: string;
  order: number; // Order within the protocol
  
  // Block configuration
  duration: number; // weeks
  phase: BlockPhase;
  intensity: IntensityLevel;
  volume: VolumeLevel;
  
  // Block parameters
  parameters?: BlockParameters;
  rules?: BlockRules;
  
  // Relations
  sessions?: BlockSession[];
  progressions?: BlockProgression[];
}

export interface BlockSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  blockId: string;
  block?: Block;
  
  // Session configuration
  name: string;
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  order: number; // Order within the block
  
  // Session content
  exercises: ExerciseConfiguration[];
  duration?: number; // Estimated duration in minutes
  notes?: string;
  
  // Session parameters
  intensity?: number; // 0.0-1.0 scale
  volume?: number; // Total volume metric
  rpe?: number; // Target RPE
}

export interface BlockProgression {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  blockId: string;
  block?: Block;
  
  // Progression configuration
  week: number; // Week within the block
  parameters: WeekParameters;
  
  // Progression rules
  rules?: ProgressionRules;
  triggers?: ProgressionTriggers;
}

// ===========================================
// ENUMS AND TYPES
// ===========================================

export type ProtocolCategory = 
  | 'strength'
  | 'hypertrophy'
  | 'powerlifting'
  | 'bodybuilding'
  | 'general_fitness'
  | 'endurance'
  | 'sport_specific'
  | 'rehabilitation';

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'elite';

export type BlockPhase = 
  | 'base'
  | 'build'
  | 'peak'
  | 'deload'
  | 'transition'
  | 'maintenance';

export type IntensityLevel = 
  | 'low'
  | 'moderate'
  | 'high'
  | 'very_high';

export type VolumeLevel = 
  | 'low'
  | 'moderate'
  | 'high'
  | 'very_high';

// ===========================================
// CONFIGURATION TYPES
// ===========================================

export interface BlockParameters {
  // Intensity parameters
  intensityRange?: {
    min: number;
    max: number;
  };
  
  // Volume parameters
  volumeRange?: {
    min: number;
    max: number;
  };
  
  // RPE parameters
  rpeRange?: {
    min: number;
    max: number;
  };
  
  // Exercise selection
  exerciseCategories?: string[];
  movementPatterns?: string[];
  
  // Recovery parameters
  restDays?: number[];
  deloadFrequency?: number; // weeks
  
  // Custom parameters
  custom?: Record<string, any>;
}

export interface BlockRules {
  // Progression rules
  progressionType?: 'linear' | 'double_progression' | 'percentage' | 'rpe_based';
  progressionRate?: number; // percentage or fixed amount
  
  // Deload rules
  deloadTriggers?: DeloadTrigger[];
  deloadIntensity?: number; // percentage reduction
  
  // Adaptation rules
  adaptationRules?: AdaptationRule[];
  
  // Custom rules
  custom?: Record<string, any>;
}

export interface DeloadTrigger {
  type: 'week_count' | 'performance_plateau' | 'fatigue_high' | 'injury_risk';
  threshold: number;
  action: 'deload' | 'rest' | 'modify';
}

export interface AdaptationRule {
  condition: string; // e.g., "if rpe > 8 for 3 sessions"
  action: string; // e.g., "reduce volume by 10%"
  priority: number; // 1-10, higher = more important
}

export interface WeekParameters {
  // Week-specific intensity
  intensity?: number;
  
  // Week-specific volume
  volume?: number;
  
  // Week-specific RPE
  rpe?: number;
  
  // Exercise modifications
  exerciseModifications?: ExerciseModification[];
  
  // Custom parameters
  custom?: Record<string, any>;
}

export interface ExerciseModification {
  exerciseId: string;
  modifications: {
    sets?: number;
    reps?: string;
    weight?: string;
    rpe?: number;
    rest?: number;
  };
}

export interface ProgressionRules {
  // Linear progression
  linear?: {
    increment: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  
  // Double progression
  doubleProgression?: {
    repIncrement: number;
    weightIncrement: number;
  };
  
  // Percentage-based
  percentage?: {
    basePercentage: number;
    increment: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  
  // RPE-based
  rpeBased?: {
    targetRpe: number;
    adjustmentRate: number;
  };
}

export interface ProgressionTriggers {
  // Performance triggers
  performance?: {
    metric: 'strength' | 'volume' | 'rpe';
    threshold: number;
    action: 'increase' | 'decrease' | 'maintain';
  }[];
  
  // Fatigue triggers
  fatigue?: {
    metric: 'rpe' | 'volume' | 'recovery';
    threshold: number;
    action: 'deload' | 'rest' | 'modify';
  }[];
  
  // Time triggers
  time?: {
    weeks: number;
    action: 'deload' | 'modify' | 'maintain';
  }[];
}

// ===========================================
// EXECUTION TYPES
// ===========================================

export interface ProtocolExecution {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  protocolId: string;
  protocol?: Protocol;
  
  userId: string;
  templateId?: string;
  
  // Execution status
  status: ExecutionStatus;
  startDate: Date;
  endDate?: Date;
  
  // Execution configuration
  parameters: ExecutionParameters;
  adaptations?: Adaptation[];
  
  // Progress tracking
  currentBlockId?: string;
  currentWeek: number;
  progress: number; // 0.0-1.0
  
  // Relations
  blockExecutions?: BlockExecution[];
  sessions?: SessionExecution[];
}

export interface BlockExecution {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  executionId: string;
  execution?: ProtocolExecution;
  
  blockId: string;
  block?: Block;
  
  // Execution status
  status: ExecutionStatus;
  startDate?: Date;
  endDate?: Date;
  
  // Execution data
  adaptations?: Adaptation[];
  notes?: string;
  
  // Progress tracking
  currentWeek: number;
  progress: number; // 0.0-1.0
}

export interface SessionExecution {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  executionId: string;
  execution?: ProtocolExecution;
  
  sessionId: string;
  
  // Execution status
  status: ExecutionStatus;
  scheduledDate: Date;
  actualDate?: Date;
  
  // Execution data
  exercises?: ExerciseExecution[];
  adaptations?: Adaptation[];
  notes?: string;
  
  // Performance metrics
  duration?: number; // Actual duration in minutes
  rpe?: number; // Actual RPE
  volume?: number; // Actual volume
}

export type ExecutionStatus = 
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'paused'
  | 'cancelled';

// ===========================================
// EXERCISE TYPES
// ===========================================

export interface ExerciseConfiguration {
  id: string;
  name: string;
  category: string;
  movementPattern: string;
  
  // Exercise parameters
  sets: number;
  reps: string; // e.g., "8-12", "5x5", "30s"
  weight: string; // e.g., "bodyweight", "80% 1RM", "RPE 8"
  rest: number; // seconds
  
  // Exercise metadata
  order: number;
  notes?: string;
  alternatives?: string[]; // Alternative exercises
}

export interface ExerciseExecution {
  exerciseId: string;
  name: string;
  
  // Actual performance
  sets: SetExecution[];
  
  // Performance metrics
  totalVolume: number;
  averageRpe: number;
  duration: number; // seconds
  
  // Notes and adaptations
  notes?: string;
  adaptations?: string[];
}

export interface SetExecution {
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number;
  rest: number; // seconds
  notes?: string;
}

// ===========================================
// ADAPTATION TYPES
// ===========================================

export interface Adaptation {
  id: string;
  type: AdaptationType;
  reason: string;
  description: string;
  
  // Adaptation parameters
  parameters: Record<string, any>;
  
  // Timing
  appliedAt: Date;
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  // Status
  isActive: boolean;
  isApproved: boolean;
}

export type AdaptationType = 
  | 'intensity_adjustment'
  | 'volume_adjustment'
  | 'exercise_substitution'
  | 'schedule_modification'
  | 'deload'
  | 'rest_day'
  | 'custom';

// ===========================================
// TEMPLATE TYPES
// ===========================================

export interface ProtocolTemplate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  protocolId: string;
  protocol?: Protocol;
  
  // Template configuration
  name: string;
  description?: string;
  
  // Template parameters
  parameters: TemplateParameters;
  isDefault: boolean;
  
  // Usage tracking
  usageCount: number;
}

export interface TemplateParameters {
  // User profile requirements
  userProfile: {
    experience: DifficultyLevel;
    goals: string[];
    equipment: string[];
    timeConstraints: {
      sessionsPerWeek: number;
      sessionDuration: number;
    };
  };
  
  // Protocol modifications
  modifications: {
    intensity?: number;
    volume?: number;
    duration?: number;
    frequency?: number;
  };
  
  // Custom parameters
  custom?: Record<string, any>;
}

// ===========================================
// ANALYTICS TYPES
// ===========================================

export interface ProtocolAnalytics {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  protocolId: string;
  userId?: string;
  
  // Analytics data
  metrics: AnalyticsMetrics;
  insights?: AnalyticsInsight[];
  recommendations?: Recommendation[];
  
  // Time period
  periodStart: Date;
  periodEnd: Date;
}

export interface AnalyticsMetrics {
  // Performance metrics
  performance: {
    strengthGains: number;
    volumeProgress: number;
    consistency: number;
  };
  
  // Adherence metrics
  adherence: {
    sessionCompletion: number;
    exerciseCompletion: number;
    timeOnTask: number;
  };
  
  // Fatigue metrics
  fatigue: {
    averageRpe: number;
    fatigueTrend: 'increasing' | 'decreasing' | 'stable';
    recoveryRate: number;
  };
  
  // Custom metrics
  custom?: Record<string, number>;
}

export interface AnalyticsInsight {
  type: 'performance' | 'adherence' | 'fatigue' | 'custom';
  title: string;
  description: string;
  confidence: number; // 0.0-1.0
  actionable: boolean;
}

export interface Recommendation {
  type: 'adjustment' | 'modification' | 'deload' | 'progression';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
}

// ===========================================
// SHARING TYPES
// ===========================================

export interface ProtocolShare {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  protocolId: string;
  sharedBy: string;
  sharedWith: string;
  
  // Share permissions
  permissions: Permission[];
  expiresAt?: Date;
  
  // Share status
  isActive: boolean;
  acceptedAt?: Date;
}

export type Permission = 'read' | 'write' | 'execute' | 'share';

// ===========================================
// API REQUEST/RESPONSE TYPES
// ===========================================

export interface CreateProtocolRequest {
  name: string;
  description?: string;
  category: ProtocolCategory;
  difficulty: DifficultyLevel;
  duration?: number;
  frequency?: number;
  overview?: string;
  principles: string[];
  requirements: string[];
  blocks: CreateBlockRequest[];
}

export interface CreateBlockRequest {
  name: string;
  description?: string;
  order: number;
  duration: number;
  phase: BlockPhase;
  intensity: IntensityLevel;
  volume: VolumeLevel;
  parameters?: BlockParameters;
  rules?: BlockRules;
  sessions: CreateBlockSessionRequest[];
}

export interface CreateBlockSessionRequest {
  name: string;
  dayOfWeek: number;
  order: number;
  exercises: ExerciseConfiguration[];
  duration?: number;
  notes?: string;
  intensity?: number;
  volume?: number;
  rpe?: number;
}

export interface ExecuteProtocolRequest {
  protocolId: string;
  templateId?: string;
  parameters: ExecutionParameters;
  startDate: Date;
}

export interface ExecutionParameters {
  // User-specific adaptations
  adaptations?: {
    intensity?: number;
    volume?: number;
    frequency?: number;
    duration?: number;
  };
  
  // Equipment constraints
  equipment?: string[];
  
  // Time constraints
  timeConstraints?: {
    maxSessionDuration: number;
    preferredDays: number[];
  };
  
  // Custom parameters
  custom?: Record<string, any>;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export interface ProtocolSummary {
  id: string;
  name: string;
  version: string;
  category: ProtocolCategory;
  difficulty: DifficultyLevel;
  duration?: number;
  frequency?: number;
  isPublic: boolean;
  usageCount: number;
  rating?: number;
}

export interface BlockSummary {
  id: string;
  name: string;
  phase: BlockPhase;
  duration: number;
  intensity: IntensityLevel;
  volume: VolumeLevel;
  order: number;
}

export interface ExecutionSummary {
  id: string;
  protocolId: string;
  protocolName: string;
  status: ExecutionStatus;
  startDate: Date;
  endDate?: Date;
  progress: number;
  currentBlock?: string;
  currentWeek: number;
}
