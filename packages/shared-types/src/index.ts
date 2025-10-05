// Core domain types - single source of truth

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
  season?: 'offseason' | 'preseason' | 'inseason' | null;
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

// 导出类型（不包含运行时代码）
export type { 
  FatigueLevel, 
  FatigueAssessmentInput, 
  FatigueAssessmentResult,
  FatigueFactor,
  FatigueStatusResponse,
  Season,
  SeasonOption,
  FeedbackType,
  FeedbackData
} from './schemas';
