import { TrainingPlan } from '../llm.js';
import {
  EquipmentId,
  MuscleGroup,
  PlanCompressionInput,
  SessionContext,
  SessionExercise,
  SetPrescription
} from './types.js';

const CORE_LIFT_KEYWORDS = [
  'squat',
  'deadlift',
  'bench press',
  'bench',
  'press',
  'pull-up',
  'pull up',
  'pullup',
  'clean',
  'snatch',
  'front squat',
  'romanian deadlift'
];

const CORE_LIFT_EXCLUSIONS = ['split squat', 'goblet squat', 'step-up', 'bulgarian'];

const CORE_LIFT_TAGS = new Set([
  'core-lift',
  'compound',
  'competition-lift'
]);

const EQUIPMENT_MAP: Record<string, EquipmentId> = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  kettlebell: 'kettlebell',
  machine: 'machine',
  cable: 'cable',
  bodyweight: 'bodyweight',
  band: 'band',
  cardio: 'cardio'
};

const MUSCLE_MAP: Record<string, MuscleGroup> = {
  chest: 'chest',
  pecs: 'chest',
  pectorals: 'chest',
  back: 'back',
  lats: 'back',
  shoulders: 'shoulders',
  deltoids: 'shoulders',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  hamstrings: 'hamstrings',
  glutes: 'glutes',
  biceps: 'biceps',
  triceps: 'triceps',
  core: 'core',
  abs: 'core',
  calves: 'calves',
  full: 'full-body'
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function estimateSetDurationSeconds(reps: number | string | undefined): number {
  if (typeof reps === 'number') {
    return Math.max(25, reps * 3 + 10);
  }
  return 40;
}

function parseEquipment(raw: unknown): EquipmentId[] {
  if (!raw) {
    return ['other'];
  }
  const values = Array.isArray(raw) ? raw : [raw];
  const mapped = values
    .map((value) => {
      if (typeof value !== 'string') return null;
      const normalized = value.toLowerCase();
      return EQUIPMENT_MAP[normalized] ?? 'other';
    })
    .filter((value): value is EquipmentId => value !== null);

  return mapped.length > 0 ? Array.from(new Set(mapped)) : ['other'];
}

function parseMuscleGroup(value: unknown): MuscleGroup {
  if (typeof value !== 'string') {
    return 'other';
  }
  const normalized = value.toLowerCase();
  const direct = MUSCLE_MAP[normalized];
  if (direct) {
    return direct;
  }

  const partialMatch = Object.keys(MUSCLE_MAP).find((key) => normalized.includes(key));
  return partialMatch ? MUSCLE_MAP[partialMatch] : 'other';
}

function parseMuscleGroups(value: unknown): MuscleGroup[] {
  if (!value) {
    return [];
  }
  const values = Array.isArray(value) ? value : [value];
  const mapped = values
    .map((item) => parseMuscleGroup(typeof item === 'string' ? item : undefined))
    .filter((group) => group !== 'other');
  return Array.from(new Set(mapped));
}

function determineCoreLift(raw: any, normalizedName: string, equipment: EquipmentId[]): boolean {
  if (typeof raw.isCoreLift === 'boolean') {
    return raw.isCoreLift;
  }
  const tags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
  if (tags.some((tag) => CORE_LIFT_TAGS.has(tag))) {
    return true;
  }
  if (raw.metadata && typeof raw.metadata === 'object') {
    if (raw.metadata.isCoreLift === true) {
      return true;
    }
    const pattern = typeof raw.metadata.movementPattern === 'string'
      ? raw.metadata.movementPattern.toLowerCase()
      : '';
    if (['squat', 'hinge', 'horizontal-press', 'vertical-press'].includes(pattern)) {
      if (equipment.includes('barbell') || equipment.includes('dumbbell') || equipment.includes('bodyweight')) {
        return true;
      }
    }
  }

  if (CORE_LIFT_EXCLUSIONS.some((keyword) => normalizedName.includes(keyword))) {
    return false;
  }

  return CORE_LIFT_KEYWORDS.some((keyword) => normalizedName.includes(keyword));
}

function createSetPrescription(
  exerciseId: string,
  index: number,
  reps: number | string | undefined,
  load?: unknown,
  effort?: unknown,
  durationSeconds?: number
): SetPrescription {
  const estimatedDurationSeconds =
    typeof durationSeconds === 'number' ? durationSeconds : estimateSetDurationSeconds(reps);

  return {
    id: `${exerciseId}-set-${index + 1}`,
    index: index + 1,
    reps: reps ?? '8-12',
    load: typeof load === 'string' || typeof load === 'number' ? String(load) : undefined,
    effort: typeof effort === 'string' ? effort : undefined,
    estimatedDurationSeconds
  };
}

function buildSets(exerciseId: string, raw: any): SetPrescription[] {
  const sets: SetPrescription[] = [];

  if (Array.isArray(raw.sets)) {
    raw.sets.forEach((set: any, index: number) => {
      sets.push(
        createSetPrescription(
          exerciseId,
          index,
          set?.reps ?? set?.targetReps ?? raw?.reps,
          set?.weight ?? set?.load,
          set?.effort ?? set?.rpe,
          set?.estimatedDurationSeconds
        )
      );
    });
    return sets;
  }

  const totalSets =
    (typeof raw.sets === 'number' && raw.sets > 0
      ? raw.sets
      : typeof raw.targetSets === 'number' && raw.targetSets > 0
      ? raw.targetSets
      : 3) as number;

  for (let i = 0; i < totalSets; i += 1) {
    sets.push(
      createSetPrescription(
        exerciseId,
        i,
        raw.reps ?? raw.targetReps ?? raw.repRange,
        raw.weight ?? raw.targetWeight,
        raw.effort ?? raw.targetEffort
      )
    );
  }

  return sets;
}

function parseRestSeconds(raw: any, isCoreLift: boolean): number {
  const restFields = [
    raw?.restTime,
    raw?.restSeconds,
    raw?.restInterval,
    raw?.targetRest,
    raw?.rest
  ];

  for (const field of restFields) {
    if (typeof field === 'number' && field > 0) {
      return field;
    }
    if (typeof field === 'string' && field.trim().endsWith('s')) {
      const parsed = Number.parseInt(field, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return isCoreLift ? 150 : 60;
}

function toSessionExercise(raw: any, fallbackId: string): SessionExercise | null {
  const name = typeof raw?.name === 'string' && raw.name.trim().length > 0 ? raw.name : fallbackId;
  const normalizedName = name.toLowerCase();
  const exerciseId =
    typeof raw?.id === 'string' && raw.id.length > 0 ? raw.id : slugify(`${fallbackId}-${name}`);

  const equipment = parseEquipment(raw?.equipment);
  const primaryMuscleGroup =
    parseMuscleGroup(
      raw?.primaryMuscleGroup ??
        raw?.primaryMuscle ??
        (Array.isArray(raw?.primaryMuscles) ? raw.primaryMuscles[0] : undefined) ??
        raw?.muscleGroup
    ) ?? 'other';

  const secondaryMuscleGroups = parseMuscleGroups(
    raw?.secondaryMuscleGroups ?? raw?.secondaryMuscles ?? raw?.muscleGroups
  );

  const isCoreLift = determineCoreLift(raw, normalizedName, equipment);
  const sets = buildSets(exerciseId, raw);
  if (sets.length === 0) {
    return null;
  }

  const targetRestSeconds = parseRestSeconds(raw, isCoreLift);

  return {
    id: exerciseId,
    name,
    isCoreLift,
    primaryMuscleGroup,
    secondaryMuscleGroups,
    equipment,
    targetRestSeconds,
    sets,
    sourceSegmentId: typeof raw?.segmentId === 'string' ? raw.segmentId : undefined
  };
}

function toSessionContext(
  microcycleId: string,
  sessionIndex: number,
  rawSession: any
): SessionContext | null {
  const exercisesRaw = Array.isArray(rawSession?.exercises) ? rawSession.exercises : [];
  const exercises: SessionExercise[] = [];

  exercisesRaw.forEach((exercise: any, index: number) => {
    const sessionExercise = toSessionExercise(exercise, `exercise-${sessionIndex + 1}-${index + 1}`);
    if (sessionExercise) {
      exercises.push(sessionExercise);
    }
  });

  if (exercises.length === 0) {
    return null;
  }

  const durationMinutes =
    typeof rawSession?.duration === 'number' && rawSession.duration > 0
      ? rawSession.duration
      : undefined;

  const estimatedSeconds = exercises.reduce((total, exercise) => {
    const work = exercise.sets.reduce((sum, set) => sum + set.estimatedDurationSeconds, 0);
    const rest = Math.max(exercise.sets.length - 1, 0) * exercise.targetRestSeconds;
    return total + work + rest;
  }, 0);

  const sessionId =
    typeof rawSession?.id === 'string' && rawSession.id.length > 0
      ? rawSession.id
      : `session-${microcycleId}-${sessionIndex + 1}`;

  return {
    sessionId,
    microcycleId,
    dayOfWeek:
      typeof rawSession?.dayOfWeek === 'number'
        ? rawSession.dayOfWeek
        : (sessionIndex % 7) + 1,
    originalDurationSeconds:
      typeof durationMinutes === 'number' ? durationMinutes * 60 : estimatedSeconds,
    exercises
  };
}

export function buildTimeCrunchInput(plan: TrainingPlan): PlanCompressionInput | null {
  if (!plan || !Array.isArray((plan as any).microcycles) || (plan as any).microcycles.length === 0) {
    return null;
  }

  const sessions: SessionContext[] = [];

  (plan as any).microcycles.forEach((microcycle: any, mcIndex: number) => {
    const microcycleId =
      typeof microcycle?.id === 'string' && microcycle.id.length > 0
        ? microcycle.id
        : `microcycle-${microcycle?.weekNumber ?? mcIndex + 1}`;

    const rawSessions = Array.isArray(microcycle?.sessions) ? microcycle.sessions : [];
    rawSessions.forEach((session: any, sessionIndex: number) => {
      const context = toSessionContext(microcycleId, sessionIndex, session);
      if (context) {
        sessions.push(context);
      }
    });
  });

  if (sessions.length === 0) {
    return null;
  }

  const planId =
    typeof plan.id === 'string' && plan.id.length > 0
      ? plan.id
      : slugify(plan.name ?? 'training-plan');

  const originalDurationSeconds = sessions.reduce(
    (total, session) => total + session.originalDurationSeconds,
    0
  );

  return {
    planId,
    sessions,
    originalDurationSeconds
  };
}
