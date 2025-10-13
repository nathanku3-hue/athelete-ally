import type { Exercise, Session, Prisma } from '../../prisma/generated/client/index.js';

export interface CompressionDiff extends Record<string, unknown> {
  removedExercises: Array<{
    id: string;
    name: string;
    estimatedMinutes: number;
    priority: 'low' | 'medium';
  }>;
  reducedExercises: Array<{
    id: string;
    name: string;
    fromSets: number;
    toSets: number;
    priority: 'medium' | 'high';
    minutesSaved: number;
  }>;
  totalMinutesSaved: number;
  originalDuration: number;
  achievedDuration: number;
  targetDuration: number;
}

export interface CompressedExercise extends Record<string, unknown> {
  id: string;
  name: string;
  category: string | null;
  sets: number | null;
  reps: string | null;
  weight: string | null;
  notes: string | null;
  order: number;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
}

export interface SessionWithExercises extends Session {
  exercises: Exercise[];
  isTimeCrunchActive: boolean;
  timeCrunchMinutes: number | null;
  timeCrunchAppliedAt: Date | null;
  compressedPlan: Prisma.JsonValue | null;
  compressionDiff: Prisma.JsonValue | null;
  compressionSummary: string | null;
  microcycle?: {
    planId: string;
    plan?: {
      id: string;
      userId: string;
    };
  };
}

export interface CompressionResult {
  compressedSession: {
    sessionId: string;
    dayOfWeek: number;
    name: string | null;
    duration: number;
    isTimeCrunchActive: boolean;
    exercises: CompressedExercise[];
    notes: string | null;
  };
  diff: CompressionDiff;
  summary: string;
}

const HIGH_PRIORITY_CATEGORIES = new Set(['strength', 'power', 'sports_specific']);
const LOW_PRIORITY_CATEGORIES = new Set([
  'mobility',
  'flexibility',
  'recovery',
  'stability',
  'prehab',
  'accessory',
]);

const MINUTES_PER_SET = 1.6; // includes movement + transition time
const REST_MINUTES = 0.75; // default rest between sets

function estimateExerciseMinutes(exercise: Exercise): number {
  const sets = Math.max(exercise.sets ?? 3, 1);
  const workMinutes = sets * MINUTES_PER_SET;
  const restPeriods = Math.max(sets - 1, 0);
  const restMinutes = restPeriods * REST_MINUTES;

  // If reps string contains "sec" favor shorter time
  if (exercise.reps && /sec|second/i.test(exercise.reps)) {
    return Math.max(sets * 0.75, 0.5);
  }

  return Number((workMinutes + restMinutes).toFixed(2));
}

function resolvePriority(exercise: Exercise): 'high' | 'medium' | 'low' {
  if (exercise.order <= 2) {
    return 'high';
  }

  const category = exercise.category?.toLowerCase();
  if (category) {
    if (HIGH_PRIORITY_CATEGORIES.has(category)) {
      return 'high';
    }

    if (LOW_PRIORITY_CATEGORIES.has(category)) {
      return 'low';
    }
  }

  if (exercise.notes && /activation|mobility|recovery/i.test(exercise.notes)) {
    return 'low';
  }

  return 'medium';
}

function buildCompressedExercise(exercise: Exercise, priority: 'high' | 'medium' | 'low', sets: number): CompressedExercise {
  return {
    id: exercise.id,
    name: exercise.name,
    category: exercise.category ?? null,
    sets,
    reps: exercise.reps ?? null,
    weight: exercise.weight ?? null,
    notes: exercise.notes ?? null,
    order: exercise.order,
    priority,
    estimatedMinutes: estimateExerciseMinutes({ ...exercise, sets }),
  };
}

export function compressSession(session: SessionWithExercises, targetMinutes: number): CompressionResult {
  const originalDuration = session.duration ?? session.exercises.reduce((acc, exercise) => acc + estimateExerciseMinutes(exercise), 0);
  const sanitizedTarget = Math.max(Math.min(targetMinutes, originalDuration), 10);

  const prioritized = session.exercises.map((exercise) => {
    const priority = resolvePriority(exercise);
    const estimatedMinutes = estimateExerciseMinutes(exercise);
    return {
      exercise,
      priority,
      estimatedMinutes,
      mutableSets: exercise.sets ?? 3,
    };
  });

  const sortedByPriority = [...prioritized].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 } as const;
    if (priorityOrder[a.priority] === priorityOrder[b.priority]) {
      // For same priority drop longer exercises first
      return b.estimatedMinutes - a.estimatedMinutes;
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  let minutesToTrim = Math.max(originalDuration - sanitizedTarget, 0);
  const removedExercises: CompressionDiff['removedExercises'] = [];
  const reducedExercises: CompressionDiff['reducedExercises'] = [];

  const activeExercises = new Map<string, { exercise: Exercise; priority: 'high' | 'medium' | 'low'; sets: number }>();
  prioritized.forEach(({ exercise, priority, mutableSets }) => {
    activeExercises.set(exercise.id, {
      exercise,
      priority,
      sets: mutableSets,
    });
  });

  // Step 1: Remove lowest priority accessories entirely
  for (const item of sortedByPriority) {
    if (minutesToTrim <= 0) break;
    if (item.priority !== 'low') continue;
    if (!activeExercises.has(item.exercise.id)) continue;

    removedExercises.push({
      id: item.exercise.id,
      name: item.exercise.name,
      estimatedMinutes: item.estimatedMinutes,
      priority: 'low',
    });
    activeExercises.delete(item.exercise.id);
    minutesToTrim = Math.max(minutesToTrim - item.estimatedMinutes, 0);
  }

  // Step 2: Reduce sets for medium priority movements
  if (minutesToTrim > 0) {
    const mediums = sortedByPriority.filter((item) => item.priority === 'medium' && activeExercises.has(item.exercise.id));
    for (const item of mediums) {
      if (minutesToTrim <= 0) break;
      const state = activeExercises.get(item.exercise.id);
      if (!state) continue;

      let currentSets = state.sets;
      const minimumSets = 2;

      while (currentSets > minimumSets && minutesToTrim > 0) {
        const projectedSets = currentSets - 1;
        const minutesSaved = estimateExerciseMinutes({ ...item.exercise, sets: currentSets }) - estimateExerciseMinutes({ ...item.exercise, sets: projectedSets });
        currentSets = projectedSets;
        minutesToTrim = Math.max(minutesToTrim - minutesSaved, 0);
        state.sets = projectedSets;
        const existing = reducedExercises.find((entry) => entry.id === item.exercise.id);
        if (existing) {
          existing.toSets = projectedSets;
          existing.minutesSaved = Number((existing.minutesSaved + minutesSaved).toFixed(2));
        } else {
          reducedExercises.push({
            id: item.exercise.id,
            name: item.exercise.name,
            fromSets: item.exercise.sets ?? 3,
            toSets: projectedSets,
            priority: 'medium',
            minutesSaved: Number(minutesSaved.toFixed(2)),
          });
        }
      }
    }
  }

  // Step 3: If still over time, shave sets from high priority but keep at least 2
  if (minutesToTrim > 0) {
    const highs = sortedByPriority.filter((item) => item.priority === 'high' && activeExercises.has(item.exercise.id));
    for (const item of highs) {
      if (minutesToTrim <= 0) break;
      const state = activeExercises.get(item.exercise.id);
      if (!state) continue;

      let currentSets = state.sets;
      const minimumSets = 2;
      while (currentSets > minimumSets && minutesToTrim > 0) {
        const projectedSets = currentSets - 1;
        const minutesSaved = estimateExerciseMinutes({ ...item.exercise, sets: currentSets }) - estimateExerciseMinutes({ ...item.exercise, sets: projectedSets });
        currentSets = projectedSets;
        minutesToTrim = Math.max(minutesToTrim - minutesSaved, 0);
        state.sets = projectedSets;
        const existing = reducedExercises.find((entry) => entry.id === item.exercise.id);
        if (existing) {
          existing.toSets = projectedSets;
          existing.minutesSaved = Number((existing.minutesSaved + minutesSaved).toFixed(2));
        } else {
          reducedExercises.push({
            id: item.exercise.id,
            name: item.exercise.name,
            fromSets: item.exercise.sets ?? 3,
            toSets: projectedSets,
            priority: 'high',
            minutesSaved: Number(minutesSaved.toFixed(2)),
          });
        }
      }
    }
  }

  // Step 4: If still above target, allow a small overage but clamp to realistic minimum
  const reconstructedExercises = Array.from(activeExercises.values())
    .map(({ exercise, priority, sets }) => buildCompressedExercise(exercise, priority, sets))
    .sort((a, b) => a.order - b.order);

  const achievedDuration = reconstructedExercises.reduce((acc, exercise) => acc + exercise.estimatedMinutes, 0);
  const finalDuration = Math.max(Math.min(achievedDuration, sanitizedTarget + 5), sanitizedTarget);
  const totalMinutesSaved = Math.max(originalDuration - finalDuration, 0);

  const diff: CompressionDiff = {
    removedExercises,
    reducedExercises,
    totalMinutesSaved: Number(totalMinutesSaved.toFixed(2)),
    originalDuration: Number(originalDuration.toFixed(2)),
    achievedDuration: Number(finalDuration.toFixed(2)),
    targetDuration: sanitizedTarget,
  };

  const summaryPieces: string[] = [];
  summaryPieces.push(`Targeted ${sanitizedTarget} minutes from ${Math.round(originalDuration)}.`);
  if (removedExercises.length) {
    const names = removedExercises.map((exercise) => exercise.name).join(', ');
    summaryPieces.push(`Removed accessory work: ${names}.`);
  }
  if (reducedExercises.length) {
    const adjustments = reducedExercises
      .map((exercise) => `${exercise.name} (${exercise.fromSets}→${exercise.toSets} sets)`)
      .join(', ');
    summaryPieces.push(`Trimmed sets on key lifts: ${adjustments}.`);
  }
  if (totalMinutesSaved <= 0.5) {
    summaryPieces.push('Unable to meaningfully reduce duration without impacting core work.');
  }

  const summary = summaryPieces.join(' ');

  return {
    compressedSession: {
      sessionId: session.id,
      dayOfWeek: session.dayOfWeek,
      name: session.name ?? null,
      duration: Number(finalDuration.toFixed(2)),
      isTimeCrunchActive: totalMinutesSaved > 0,
      exercises: reconstructedExercises,
      notes: ((session as unknown as { notes?: string | null }).notes ?? null),
    },
    diff,
    summary,
  };
}
