import { BlockCandidate, MuscleGroup, PairingCandidate, SessionExercise, SupersetPriority } from './types.js';

const ANTAGONIST_MAP: Record<MuscleGroup, MuscleGroup[]> = {
  chest: ['back'],
  back: ['chest'],
  shoulders: ['back', 'core'],
  quadriceps: ['hamstrings', 'glutes'],
  hamstrings: ['quadriceps', 'glutes'],
  glutes: ['quadriceps', 'hamstrings'],
  biceps: ['triceps'],
  triceps: ['biceps'],
  core: ['glutes', 'back'],
  calves: ['quadriceps', 'hamstrings'],
  'full-body': [],
  other: []
};

function isAntagonistPair(a: MuscleGroup, b: MuscleGroup): boolean {
  const antagonists = ANTAGONIST_MAP[a] ?? [];
  return antagonists.includes(b);
}

function intersects<T>(a: T[], b: T[]): boolean {
  return a.some((item) => b.includes(item));
}

function determineSupersetPriority(
  primary: SessionExercise,
  secondary: SessionExercise
): { priority: SupersetPriority; features: string[]; baseScore: number } | null {
  const features: string[] = [];
  let score = 0;

  if (isAntagonistPair(primary.primaryMuscleGroup, secondary.primaryMuscleGroup)) {
    features.push('antagonist_match');
    score += 3;
    return { priority: 'antagonist', features, baseScore: score };
  }

  const shareEquipment = intersects(primary.equipment, secondary.equipment);
  const muscleGroupsSeparate =
    primary.primaryMuscleGroup !== secondary.primaryMuscleGroup &&
    !intersects(primary.secondaryMuscleGroups, [secondary.primaryMuscleGroup]) &&
    !intersects(secondary.secondaryMuscleGroups, [primary.primaryMuscleGroup]);

  if (shareEquipment) {
    features.push('shared_equipment');
    score += 2;
    return { priority: 'equipment', features, baseScore: score };
  }

  if (muscleGroupsSeparate) {
    features.push('non_competing');
    score += 1;
    return { priority: 'non_competing', features, baseScore: score };
  }

  return null;
}

export function buildSupersetCandidates(exercises: SessionExercise[]): PairingCandidate[] {
  const candidates: PairingCandidate[] = [];

  for (let i = 0; i < exercises.length; i += 1) {
    for (let j = i + 1; j < exercises.length; j += 1) {
      const a = exercises[i];
      const b = exercises[j];
      if (a.isCoreLift || b.isCoreLift) {
        continue;
      }

      const priorityResult = determineSupersetPriority(a, b);
      if (!priorityResult) {
        continue;
      }

      const { priority, features, baseScore } = priorityResult;

      // Reward similar set counts to avoid awkward alternations.
      const setDelta = Math.abs(a.sets.length - b.sets.length);
      const cadenceScore = Math.max(0, 1 - setDelta);

      const score = baseScore + cadenceScore;
      candidates.push({
        primary: a,
        secondary: b,
        score,
        priority,
        features
      });
    }
  }

  // Highest score first; deterministic fallback on name to maintain repeatability.
  return candidates.sort((left, right) => {
    if (left.score !== right.score) {
      return right.score - left.score;
    }
    const leftKey = `${left.primary.name}-${left.secondary.name}`;
    const rightKey = `${right.primary.name}-${right.secondary.name}`;
    return leftKey.localeCompare(rightKey);
  });
}

export function buildBlockCandidates(exercises: SessionExercise[]): BlockCandidate[] {
  const candidates: BlockCandidate[] = [];
  const muscleGroups = new Map<MuscleGroup, SessionExercise[]>();
  const equipmentGroups = new Map<string, SessionExercise[]>();

  exercises.forEach((exercise) => {
    if (exercise.isCoreLift) {
      return;
    }
    const existingMuscle = muscleGroups.get(exercise.primaryMuscleGroup) ?? [];
    existingMuscle.push(exercise);
    muscleGroups.set(exercise.primaryMuscleGroup, existingMuscle);

    exercise.equipment.forEach((equip) => {
      const existingEquip = equipmentGroups.get(equip) ?? [];
      existingEquip.push(exercise);
      equipmentGroups.set(equip, existingEquip);
    });
  });

  muscleGroups.forEach((groupExercises, muscle) => {
    if (groupExercises.length < 2) {
      return;
    }
    candidates.push({
      exercises: groupExercises,
      rationale: 'metabolic_stress',
      score: 3,
      features: [`grouped_by_${muscle}`]
    });
  });

  equipmentGroups.forEach((groupExercises, equipment) => {
    if (groupExercises.length < 2) {
      return;
    }
    candidates.push({
      exercises: groupExercises,
      rationale: 'equipment_cluster',
      score: 2,
      features: [`shared_equipment_${equipment}`]
    });
  });

  return candidates.sort((left, right) => {
    if (left.score !== right.score) {
      return right.score - left.score;
    }
    const leftKey = left.exercises.map((exercise) => exercise.name).join('-');
    const rightKey = right.exercises.map((exercise) => exercise.name).join('-');
    return leftKey.localeCompare(rightKey);
  });
}

export function selectSupersetPairs(
  exercises: SessionExercise[]
): Array<{ first: SessionExercise; second: SessionExercise; candidate: PairingCandidate }> {
  const selected: Array<{
    first: SessionExercise;
    second: SessionExercise;
    candidate: PairingCandidate;
  }> = [];
  const usedIds = new Set<string>();

  for (const candidate of buildSupersetCandidates(exercises)) {
    const { primary, secondary } = candidate;
    if (usedIds.has(primary.id) || usedIds.has(secondary.id)) {
      continue;
    }
    usedIds.add(primary.id);
    usedIds.add(secondary.id);
    selected.push({ first: primary, second: secondary, candidate });
  }

  return selected;
}

export function selectBlockGroup(
  exercises: SessionExercise[],
  maxExercises: number
):
  | {
      exercises: SessionExercise[];
      candidate: BlockCandidate;
    }
  | null {
  const candidates = buildBlockCandidates(exercises);
  if (candidates.length === 0) {
    return null;
  }

  for (const candidate of candidates) {
    const chosen = candidate.exercises.slice(0, Math.min(maxExercises, candidate.exercises.length));
    if (chosen.length < 2) {
      continue;
    }
    return {
      exercises: chosen,
      candidate: {
        ...candidate,
        exercises: chosen
      }
    };
  }

  return null;
}
