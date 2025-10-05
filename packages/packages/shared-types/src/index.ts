// Core domain types - single source of truth

// ============================================================================
// Fatigue Assessment Types - Canonical Definitions
// ============================================================================

/**
 * Canonical fatigue level enum - single source of truth
 * Used across API, frontend, and all services
 */
export type FatigueLevel = 'low' | 'moderate' | 'high';

/**
 * Fatigue assessment input data
 */
export interface FatigueAssessmentInput {
  sleepQuality: number; // 1-10 scale
  stressLevel: number; // 1-10 scale  
  muscleSoreness: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  motivation: number; // 1-10 scale
}

/**
 * Fatigue assessment result - canonical response format
 */
export interface FatigueAssessmentResult {
  success: boolean;
  fatigueScore: number; // 0-10 scale
  level: FatigueLevel;
  message: string;
  timestamp: string;
}

/**
 * Fatigue status response - for GET /api/v1/fatigue/status
 */
export interface FatigueStatusResponse {
  level: FatigueLevel;
  score: number; // 0-10 scale
  factors: FatigueFactor[];
  recommendations: string[];
  lastUpdated: string;
  nextAssessment: string;
}

export interface FatigueFactor {
  type: 'sleep_quality' | 'training_load' | 'stress_level' | 'recovery_time';
  value: number;
  impact: 'low' | 'moderate' | 'high';
  description: string;
}

// ============================================================================
// Season Types - Canonical Definitions  
// ============================================================================

/**
 * Canonical season enum - single source of truth
 * Used across onboarding, plans, and all services
 */
export type Season = 'offseason' | 'preseason' | 'inseason';

/**
 * Season option for UI display
 */
export interface SeasonOption {
  id: Season;
  title: string;
  description: string;
}

// ============================================================================
// Feedback Types - Canonical Definitions
// ============================================================================

/**
 * Canonical feedback type enum
 */
export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'general';

/**
 * Feedback data structure
 */
export interface FeedbackData {
  type: FeedbackType;
  rating: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  userEmail?: string;
  userId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  equipment: string[];
  setup?: string;
  difficulty: number;
  progression?: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string;
  tips?: string;
  videoUrl?: string;
  imageUrl?: string;
  safetyNotes?: string;
  modifications?: Array<{
    name: string;
    description: string;
    difficulty: number;
  }>;
  contraindications?: string;
  tags: string[];
  isActive: boolean;
  popularity: number;
  // Frontend specific fields
  averageRating?: number;
  totalRatings?: number;
}

export interface WorkoutExercise {
  id: string;
  sessionId: string;
  exerciseId?: string;
  exerciseName: string;
  category: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
  targetDuration?: number;
  targetRest?: number;
  actualSets: number;
  actualReps: number;
  actualWeight?: number;
  actualDuration?: number;
  actualRest?: number;
  totalVolume?: number;
  averageRPE?: number;
  maxRPE?: number;
  minRPE?: number;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
  records: WorkoutRecord[];
}

export interface WorkoutRecord {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps: number;
  targetWeight?: number;
  actualWeight?: number;
  targetDuration?: number;
  actualDuration?: number;
  restTime?: number;
  rpe?: number;
  form?: number;
  difficulty?: number;
  isCompleted: boolean;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface OnboardingData {
  userId: string;
  purpose?: 'general_fitness' | 'sport_performance' | 'body_recomposition' | 'muscle_building' | 'weight_loss' | 'rehabilitation';
  purposeDetails?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced';
  season?: Season | null;
  competitionDate?: string;
  availabilityDays?: string[];
  timeSlots?: string[];
  weeklyGoalDays?: number;
  equipment?: string[];
  fixedSchedules?: Array<{
    day: string;
    start: string;
    end: string;
  }>;
  recoveryHabits?: string[];
  onboardingStep?: number;
  isOnboardingComplete?: boolean;
  // Frontend specific fields
  currentStep?: number;
  isCompleted?: boolean;
  submittedAt?: number;
}

export interface OnboardingState {
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

export interface OnboardingContextType {
  state: OnboardingState;
  updateData: (data: Partial<OnboardingData>) => void;
  setStep: (step: number) => void;
  markCompleted: () => void;
  clearData: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  validateStep: (step: number, dataToValidate?: Partial<OnboardingData>) => boolean;
  getStepProgress: () => { current: number; total: number; percentage: number };
  submitData: () => Promise<{ success: boolean; planId?: string; jobId?: string; error?: string }>;
}

// 导出统一的Onboarding Schema
export * from './schemas/onboarding';

// 导出RPE和User Preferences Schema
export * from './schemas/rpe';
export * from './schemas/enhanced-plan';
export * from './schemas/feedback';
export * from './schemas/api';
export * from './schemas/hrv';

// 导出运行时验证模式
export * from './schemas';

// 导出向后兼容性映射
export * from './legacy-mappings';

// 导出遥测和配置
export * from './telemetry';
export * from './config';

// 导出服务器专用工具（仅用于服务器端）
export * from './server-only';

// 导出指标适配器（仅用于服务器端）
export * from './metrics-adapter';

// 导出切换计划配置
export * from './cutover-plan';
