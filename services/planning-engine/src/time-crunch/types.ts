/**
 * Time Crunch Mode domain types.
 *
 * These types model the amended Time Crunch compression rules:
 * - Core lifts are protected: run first, never paired/blocked, max three working sets.
 * - Accessory work may be grouped via antagonist supersets, equipment pairings, or metabolic blocks.
 * - Compression telemetry must capture decision paths for post-run analysis.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'calves'
  | 'full-body'
  | 'other';

export type EquipmentId =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'band'
  | 'cardio'
  | 'other';

export interface SetPrescription {
  /**
   * A unique identifier to correlate telemetry with UI surfaces.
   */
  id: string;
  /**
   * Ordinal position (1-indexed) of the set within the exercise.
   */
  index: number;
  /**
   * Target repetitions. Supports string ranges such as "8-10".
   */
  reps: number | string;
  /**
   * Optional load prescription stored as a human-readable string (e.g. "70% 1RM").
   */
  load?: string;
  /**
   * Estimated effort target (RPE or RIR notation) if provided by programming.
   */
  effort?: string;
  /**
   * Estimated time to execute the set in seconds (excluding rest).
   */
  estimatedDurationSeconds: number;
}

export interface SessionExercise {
  id: string;
  name: string;
  /**
   * Flag identifying movements that must remain first, unpaired, and capped at three sets.
   */
  isCoreLift: boolean;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  equipment: EquipmentId[];
  /**
   * Baseline rest interval between working sets in seconds.
   */
  targetRestSeconds: number;
  /**
   * Structured set prescriptions. For compression we will truncate to <= 3 entries.
   */
  sets: SetPrescription[];
  /**
   * Metadata describing where the exercise originated (programmed block, circuit, etc.).
   */
  sourceSegmentId?: string;
}

export interface SessionContext {
  sessionId: string;
  microcycleId: string;
  dayOfWeek: number;
  /**
   * Original scheduled duration before compression (seconds).
   */
  originalDurationSeconds: number;
  /**
   * Exercises in programmed order prior to compression.
   */
  exercises: SessionExercise[];
}

export type SegmentKind =
  | 'core_lift'
  | 'accessory_superset'
  | 'accessory_block'
  | 'accessory_single';

export interface SegmentTiming {
  /**
   * Estimated active time (sum of set durations) in seconds.
   */
  workSeconds: number;
  /**
   * Estimated rest intervals added for this segment in seconds.
   */
  restSeconds: number;
  /**
   * Total duration (work + rest) in seconds.
   */
  totalSeconds: number;
}

export interface SegmentBase {
  id: string;
  kind: SegmentKind;
  order: number;
  timing: SegmentTiming;
}

export interface CoreLiftSegment extends SegmentBase {
  kind: 'core_lift';
  exercise: SessionExercise;
}

export type SupersetPriority = 'antagonist' | 'equipment' | 'non_competing';

export interface AccessorySupersetSegment extends SegmentBase {
  kind: 'accessory_superset';
  /**
   * Exactly two exercises paired for density.
   */
  exercises: [SessionExercise, SessionExercise];
  priority: SupersetPriority;
  /**
   * Rest guidance applied between alternating sets.
   */
  restBetweenAlternationsSeconds: number;
}

export interface AccessoryBlockSegment extends SegmentBase {
  kind: 'accessory_block';
  /**
   * Block groups accommodate 2-3 exercises sharing muscle focus or equipment.
   */
  exercises: SessionExercise[];
  rounds: number;
  restBetweenExercisesSeconds: number;
  restBetweenRoundsSeconds: number;
  rationale: 'metabolic_stress' | 'equipment_cluster' | 'coach_defined';
}

export interface AccessorySingleSegment extends SegmentBase {
  kind: 'accessory_single';
  exercise: SessionExercise;
}

export type SessionSegment =
  | CoreLiftSegment
  | AccessorySupersetSegment
  | AccessoryBlockSegment
  | AccessorySingleSegment;

export interface CompressionTelemetryEvent {
  segmentId: string;
  kind: SegmentKind | 'session';
  strategy: string;
  notes?: string;
}

export interface CompressedSessionSummary {
  sessionId: string;
  originalDurationSeconds: number;
  compressedDurationSeconds: number;
  /**
   * Delta in seconds (original - compressed). Positive values indicate saved time.
   */
  durationDeltaSeconds: number;
  /**
   * Ordering of segment identifiers returned to the client.
   */
  segmentOrder: string[];
}

export interface CompressedSession {
  context: SessionContext;
  segments: SessionSegment[];
  summary: CompressedSessionSummary;
  telemetry: CompressionTelemetryEvent[];
}

export interface CompressionOutcome {
  planId: string;
  targetMinutes: number;
  /**
   * Total duration after compression in seconds.
   */
  compressedDurationSeconds: number;
  sessions: CompressedSession[];
  /**
   * Indicates whether the target time was achieved for all sessions.
   */
  meetsTimeConstraint: boolean;
}

export interface CompressionConfig {
  /**
   * Maximum working sets to retain for core lifts (default enforced at 3).
   */
  coreLiftSetCap: number;
  /**
   * Rest interval (seconds) to preserve between core lift sets.
   */
  coreLiftRestSeconds: number;
  /**
   * Default rest between superset alternations when not provided by program.
   */
  supersetRestSeconds: number;
  /**
   * Default rest between exercises inside accessory blocks.
   */
  blockInterExerciseRestSeconds: number;
  /**
   * Rest between block rounds (circuits).
   */
  blockRoundRestSeconds: number;
  /**
    * Maximum exercises per accessory block (typically 3).
    */
  maxBlockExercises: number;
}

export interface PairingCandidate {
  primary: SessionExercise;
  secondary: SessionExercise;
  score: number;
  priority: SupersetPriority;
  /**
   * Features evaluated for telemetry/debugging (e.g., "antagonist_match").
   */
  features: string[];
}

export interface BlockCandidate {
  exercises: SessionExercise[];
  rationale: AccessoryBlockSegment['rationale'];
  score: number;
  features: string[];
}

export interface PlanCompressionInput {
  planId: string;
  /**
   * Sessions targeted for compression.
   */
  sessions: SessionContext[];
  /**
   * Baseline duration for the entire plan (seconds). Used for telemetry deltas.
   */
  originalDurationSeconds: number;
}
