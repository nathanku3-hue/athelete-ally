import {
  compressPlan,
  compressSession,
  type CompressionOutcome,
  type CompressedSession,
  type PlanCompressionInput,
  type SessionContext,
  type SessionExercise,
  type SetPrescription
} from '../../../time-crunch/index.js';

const createSet = (exerciseId: string, index: number, durationSeconds = 40): SetPrescription => ({
  id: `${exerciseId}-set-${index}`,
  index,
  reps: 8,
  estimatedDurationSeconds: durationSeconds
});

const baseExercise = (overrides: Partial<SessionExercise> = {}): SessionExercise => {
  const id = overrides.id ?? 'exercise';
  return {
    id,
    name: overrides.name ?? 'Exercise',
    isCoreLift: overrides.isCoreLift ?? false,
    primaryMuscleGroup: overrides.primaryMuscleGroup ?? 'other',
    secondaryMuscleGroups: overrides.secondaryMuscleGroups ?? [],
    equipment: overrides.equipment ?? ['other'],
    targetRestSeconds: overrides.targetRestSeconds ?? 60,
    sets:
      overrides.sets ??
      [createSet(id, 1), createSet(id, 2), createSet(id, 3), createSet(id, 4)],
    sourceSegmentId: overrides.sourceSegmentId
  };
};

const baseSession = (exercises: SessionExercise[]): SessionContext => ({
  sessionId: 'session-1',
  microcycleId: 'microcycle-1',
  dayOfWeek: 1,
  originalDurationSeconds: 3600,
  exercises
});

describe('compressSession', () => {
  it('keeps core lifts first, unpaired, and capped at three sets', () => {
    const squat = baseExercise({
      id: 'squat',
      name: 'Back Squat',
      isCoreLift: true,
      primaryMuscleGroup: 'quadriceps',
      secondaryMuscleGroups: ['glutes'],
      equipment: ['barbell'],
      targetRestSeconds: 180
    });

    const bench = baseExercise({
      id: 'bench',
      name: 'Bench Press',
      isCoreLift: true,
      primaryMuscleGroup: 'chest',
      secondaryMuscleGroups: ['triceps'],
      equipment: ['barbell'],
      targetRestSeconds: 180
    });

    const curl = baseExercise({
      id: 'curl',
      name: 'Curl',
      primaryMuscleGroup: 'biceps',
      secondaryMuscleGroups: ['other'],
      equipment: ['dumbbell']
    });

    const session = baseSession([curl, squat, bench]);

    const compressed = compressSession(session, {
      targetMinutes: 45,
      config: {
        coreLiftSetCap: 3,
        coreLiftRestSeconds: 180
      }
    });

    const [firstSegment, secondSegment] = compressed.segments;
    if (firstSegment.kind !== 'core_lift' || secondSegment.kind !== 'core_lift') {
      throw new Error('Expected first two segments to be core lifts');
    }

    expect(firstSegment.exercise.sets).toHaveLength(3);
    expect(firstSegment.exercise.targetRestSeconds).toBe(180);
    expect(firstSegment.timing.restSeconds).toBe(360);

    expect(secondSegment.exercise.sets).toHaveLength(3);
    expect(secondSegment.exercise.targetRestSeconds).toBe(180);
    expect(secondSegment.timing.workSeconds).toBeGreaterThan(0);
  });

  it('pairs accessory exercises into antagonist supersets with shared rest guidance', () => {
    const squat = baseExercise({
      id: 'squat',
      name: 'Back Squat',
      isCoreLift: true,
      primaryMuscleGroup: 'quadriceps',
      equipment: ['barbell'],
      targetRestSeconds: 180
    });

    const bench = baseExercise({
      id: 'bench',
      name: 'Bench Press',
      primaryMuscleGroup: 'chest',
      equipment: ['barbell'],
      secondaryMuscleGroups: ['triceps']
    });

    const row = baseExercise({
      id: 'row',
      name: 'Row',
      primaryMuscleGroup: 'back',
      equipment: ['barbell'],
      secondaryMuscleGroups: ['biceps']
    });

    const session = baseSession([squat, bench, row]);

    const compressed = compressSession(session, {
      targetMinutes: 40,
      config: {
        supersetRestSeconds: 45
      }
    });

    const superset = compressed.segments.find(
      (segment) => segment.kind === 'accessory_superset'
    );

    expect(superset).toBeDefined();
    if (superset && superset.kind === 'accessory_superset') {
      expect(superset.priority).toBe('antagonist');
      expect(superset.restBetweenAlternationsSeconds).toBe(45);
      expect(superset.exercises[0].sets).toHaveLength(3);
      expect(superset.exercises[1].sets).toHaveLength(3);
    }
  });

  it('groups remaining accessories into blocks when sharing a muscle focus', () => {
    const squat = baseExercise({
      id: 'squat',
      name: 'Back Squat',
      isCoreLift: true,
      primaryMuscleGroup: 'quadriceps',
      equipment: ['barbell'],
      targetRestSeconds: 180
    });

    const lateralRaise = baseExercise({
      id: 'lat-raise',
      name: 'Lateral Raise',
      primaryMuscleGroup: 'shoulders',
      equipment: ['dumbbell']
    });

    const facePull = baseExercise({
      id: 'face-pull',
      name: 'Face Pull',
      primaryMuscleGroup: 'shoulders',
      equipment: ['cable']
    });

    const overheadPress = baseExercise({
      id: 'oh-press',
      name: 'Overhead Press',
      primaryMuscleGroup: 'shoulders',
      equipment: ['machine']
    });

    const session = baseSession([squat, lateralRaise, facePull, overheadPress]);

    const compressed = compressSession(session, {
      targetMinutes: 35,
      config: {
        blockInterExerciseRestSeconds: 20,
        blockRoundRestSeconds: 45,
        maxBlockExercises: 3
      }
    });

    const block = compressed.segments.find(
      (segment) => segment.kind === 'accessory_block'
    );

    expect(block).toBeDefined();
    if (block && block.kind === 'accessory_block') {
      expect(block.exercises).toHaveLength(3);
      expect(block.rounds).toBeGreaterThanOrEqual(1);
      expect(block.restBetweenExercisesSeconds).toBe(20);
      expect(block.restBetweenRoundsSeconds).toBe(45);
      expect(block.rationale).toBe('metabolic_stress');
    }
  });
});

describe('compressPlan', () => {
  it('summarises session outcomes and checks target compliance', () => {
    const session = baseSession([
      baseExercise({
        id: 'deadlift',
        name: 'Deadlift',
        isCoreLift: true,
        primaryMuscleGroup: 'hamstrings',
        equipment: ['barbell'],
        targetRestSeconds: 180
      }),
      baseExercise({
        id: 'lunges',
        name: 'Walking Lunges',
        primaryMuscleGroup: 'quadriceps',
        equipment: ['dumbbell']
      })
    ]);

    const input: PlanCompressionInput = {
      planId: 'plan-123',
      originalDurationSeconds: 3600,
      sessions: [session]
    };

    const outcome: CompressionOutcome = compressPlan(input, {
      targetMinutes: 50
    });

    expect(outcome.planId).toBe('plan-123');
    expect(outcome.sessions).toHaveLength(1);

    const [compressedSession]: CompressedSession[] = outcome.sessions;
    expect(compressedSession.summary.compressedDurationSeconds).toBeLessThanOrEqual(50 * 60);
    expect(outcome.meetsTimeConstraint).toBe(true);
  });
});
