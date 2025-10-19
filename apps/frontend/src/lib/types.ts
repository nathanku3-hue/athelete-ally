// src/lib/types.ts

/**
 * 定義單個訓練動作的數據結構
 */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  /**
   * 標記此動作是否為核心複合動作。
   * true: 核心動作 (如深蹲)，需要在最後一組後記錄 RPE。
   * false: 輔助動作，無需記錄 RPE。
   */
  isCoreLift: boolean;
}

/**
 * 定義單個訓練組的數據結構
 */
export interface Set {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null; // 只有核心動作的最後一組才需要
  isComplete: boolean;
}

/**
 * 定義一個完整的訓練日計畫
 */
export interface WorkoutSession {
  id: string;
  date: string;
  fatigueScore: number | null;
  sessionRPE: number | null;
  exercises: {
    exerciseId: string;
    sets: Set[];
  }[];
}

// Time Crunch Preview Types
export interface TimeCrunchSet {
  id: string;
  index: number;
  reps: number | string;
  load?: string;
  effort?: string;
  estimatedDurationSeconds: number;
}

export interface TimeCrunchExerciseSnapshot {
  id: string;
  name: string;
  sets: TimeCrunchSet[];
  targetRestSeconds: number;
}

export interface TimeCrunchTiming {
  workSeconds: number;
  restSeconds: number;
  totalSeconds: number;
}

export type TimeCrunchSegmentKind =
  | 'core_lift'
  | 'accessory_superset'
  | 'accessory_block'
  | 'accessory_single';

interface TimeCrunchSegmentBase {
  id: string;
  kind: TimeCrunchSegmentKind;
  order: number;
  timing: TimeCrunchTiming;
}

export interface TimeCrunchCoreLiftSegment extends TimeCrunchSegmentBase {
  kind: 'core_lift';
  exercise: TimeCrunchExerciseSnapshot;
}

export type TimeCrunchSupersetPriority = 'antagonist' | 'equipment' | 'non_competing';

export interface TimeCrunchSupersetSegment extends TimeCrunchSegmentBase {
  kind: 'accessory_superset';
  exercises: [TimeCrunchExerciseSnapshot, TimeCrunchExerciseSnapshot];
  priority: TimeCrunchSupersetPriority;
  restBetweenAlternationsSeconds: number;
}

export interface TimeCrunchBlockSegment extends TimeCrunchSegmentBase {
  kind: 'accessory_block';
  exercises: TimeCrunchExerciseSnapshot[];
  rounds: number;
  restBetweenExercisesSeconds: number;
  restBetweenRoundsSeconds: number;
  rationale: 'metabolic_stress' | 'equipment_cluster' | 'coach_defined';
}

export interface TimeCrunchSingleSegment extends TimeCrunchSegmentBase {
  kind: 'accessory_single';
  exercise: TimeCrunchExerciseSnapshot;
}

export type TimeCrunchSegment =
  | TimeCrunchCoreLiftSegment
  | TimeCrunchSupersetSegment
  | TimeCrunchBlockSegment
  | TimeCrunchSingleSegment;

export interface TimeCrunchSessionContext {
  sessionId: string;
  microcycleId: string;
  dayOfWeek: number;
  originalDurationSeconds: number;
}

export interface TimeCrunchSessionSummary {
  sessionId: string;
  originalDurationSeconds: number;
  compressedDurationSeconds: number;
  durationDeltaSeconds: number;
  segmentOrder: string[];
}

export interface TimeCrunchTelemetryEvent {
  segmentId: string;
  kind: string;
  strategy: string;
  notes?: string;
}

export interface TimeCrunchPreviewSession {
  context: TimeCrunchSessionContext;
  summary: TimeCrunchSessionSummary;
  segments: TimeCrunchSegment[];
  telemetry?: TimeCrunchTelemetryEvent[];
}

export interface TimeCrunchPreviewResponse {
  planId: string;
  targetMinutes: number;
  originalDurationSeconds: number;
  compressedDurationSeconds: number;
  meetsTimeConstraint: boolean;
  sessions: TimeCrunchPreviewSession[];
}
