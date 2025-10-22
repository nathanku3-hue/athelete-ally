import {
  AccessoryBlockSegment,
  AccessorySingleSegment,
  AccessorySupersetSegment,
  CompressionConfig,
  CompressionOutcome,
  CompressedSession,
  CompressedSessionSummary,
  CompressionTelemetryEvent,
  CoreLiftSegment,
  PairingCandidate,
  PlanCompressionInput,
  SessionContext,
  SessionExercise,
  SessionSegment,
  SetPrescription
} from './types.js';
import { resolveCompressionConfig } from './config.js';
import { selectBlockGroup, selectSupersetPairs } from './pairing.js';

type SelectedBlockGroup = NonNullable<ReturnType<typeof selectBlockGroup>>;

const ACCESSORY_SET_CAP = 3;

export interface SessionCompressionOptions {
  targetMinutes: number;
  config?: Partial<CompressionConfig>;
}

export type PlanCompressionOptions = SessionCompressionOptions;

const SECONDS_PER_MINUTE = 60;

function cloneSets(sets: SetPrescription[], cap: number): SetPrescription[] {
  return sets.slice(0, cap).map((set) => ({ ...set }));
}

function calculateWorkSeconds(sets: SetPrescription[]): number {
  return sets.reduce((total, set) => total + set.estimatedDurationSeconds, 0);
}

function segmentExerciseIds(segment: SessionSegment): string[] {
  switch (segment.kind) {
    case 'core_lift':
      return [segment.exercise.id];
    case 'accessory_superset':
      return segment.exercises.map((exercise) => exercise.id);
    case 'accessory_block':
      return segment.exercises.map((exercise) => exercise.id);
    case 'accessory_single':
      return [segment.exercise.id];
    default:
      return [];
  }
}

function createCoreLiftSegment(
  exercise: SessionExercise,
  order: number,
  config: CompressionConfig
): { segment: CoreLiftSegment; telemetry: CompressionTelemetryEvent } {
  const retainedSets = cloneSets(exercise.sets, Math.min(config.coreLiftSetCap, exercise.sets.length));
  const workSeconds = calculateWorkSeconds(retainedSets);
  const restIntervals = Math.max(retainedSets.length - 1, 0);
  const restSeconds = restIntervals * config.coreLiftRestSeconds;

  const segment: CoreLiftSegment = {
    id: `tc-core-${exercise.id}`,
    kind: 'core_lift',
    order,
    timing: {
      workSeconds,
      restSeconds,
      totalSeconds: workSeconds + restSeconds
    },
    exercise: {
      ...exercise,
      targetRestSeconds: config.coreLiftRestSeconds,
      sets: retainedSets
    }
  };

  return {
    segment,
    telemetry: {
      segmentId: segment.id,
      kind: segment.kind,
      strategy: 'core_protected',
      notes: `Retained ${retainedSets.length} sets with ${config.coreLiftRestSeconds}s rest`
    }
  };
}

function createSupersetSegment(
  pair: { first: SessionExercise; second: SessionExercise; candidate: PairingCandidate },
  order: number,
  config: CompressionConfig
): { segment: AccessorySupersetSegment; telemetry: CompressionTelemetryEvent } {
  const rounds = Math.min(
    ACCESSORY_SET_CAP,
    pair.first.sets.length,
    pair.second.sets.length
  );

  const firstSets = cloneSets(pair.first.sets, rounds);
  const secondSets = cloneSets(pair.second.sets, rounds);
  const workSeconds = calculateWorkSeconds(firstSets) + calculateWorkSeconds(secondSets);
  const restSeconds = Math.max(rounds - 1, 0) * config.supersetRestSeconds;

  const segment: AccessorySupersetSegment = {
    id: `tc-superset-${pair.first.id}-${pair.second.id}`,
    kind: 'accessory_superset',
    order,
    exercises: [
      {
        ...pair.first,
        sets: firstSets,
        targetRestSeconds: config.supersetRestSeconds
      },
      {
        ...pair.second,
        sets: secondSets,
        targetRestSeconds: config.supersetRestSeconds
      }
    ],
    priority: pair.candidate.priority,
    restBetweenAlternationsSeconds: config.supersetRestSeconds,
    timing: {
      workSeconds,
      restSeconds,
      totalSeconds: workSeconds + restSeconds
    }
  };

  return {
    segment,
    telemetry: {
      segmentId: segment.id,
      kind: segment.kind,
      strategy: `superset_${pair.candidate.priority}`,
      notes: pair.candidate.features.join(',')
    }
  };
}

function createBlockSegment(
  block: SelectedBlockGroup,
  order: number,
  config: CompressionConfig
): { segment: AccessoryBlockSegment; telemetry: CompressionTelemetryEvent } {
  const rounds = Math.min(
    ACCESSORY_SET_CAP,
    ...block.exercises.map((exercise) => exercise.sets.length)
  );

  const exercises = block.exercises.map((exercise) => ({
    ...exercise,
    sets: cloneSets(exercise.sets, rounds),
    targetRestSeconds: config.blockInterExerciseRestSeconds
  }));

  const workSeconds = exercises.reduce(
    (total, exercise) => total + calculateWorkSeconds(exercise.sets),
    0
  );
  const interExerciseRest =
    Math.max(exercises.length - 1, 0) * config.blockInterExerciseRestSeconds * rounds;
  const roundRest = Math.max(rounds - 1, 0) * config.blockRoundRestSeconds;
  const restSeconds = interExerciseRest + roundRest;

  const segment: AccessoryBlockSegment = {
    id: `tc-block-${exercises.map((exercise) => exercise.id).join('-')}`,
    kind: 'accessory_block',
    order,
    exercises,
    rounds,
    restBetweenExercisesSeconds: config.blockInterExerciseRestSeconds,
    restBetweenRoundsSeconds: config.blockRoundRestSeconds,
    rationale: block.candidate.rationale,
    timing: {
      workSeconds,
      restSeconds,
      totalSeconds: workSeconds + restSeconds
    }
  };

  return {
    segment,
    telemetry: {
      segmentId: segment.id,
      kind: segment.kind,
      strategy: `block_${block.candidate.rationale}`,
      notes: block.candidate.features.join(',')
    }
  };
}

function createAccessorySingleSegment(
  exercise: SessionExercise,
  order: number
): { segment: AccessorySingleSegment; telemetry: CompressionTelemetryEvent } {
  const sets = cloneSets(exercise.sets, Math.min(ACCESSORY_SET_CAP, exercise.sets.length));
  const workSeconds = calculateWorkSeconds(sets);
  const restSeconds = Math.max(sets.length - 1, 0) * exercise.targetRestSeconds;

  const segment: AccessorySingleSegment = {
    id: `tc-accessory-${exercise.id}`,
    kind: 'accessory_single',
    order,
    exercise: {
      ...exercise,
      sets
    },
    timing: {
      workSeconds,
      restSeconds,
      totalSeconds: workSeconds + restSeconds
    }
  };

  return {
    segment,
    telemetry: {
      segmentId: segment.id,
      kind: segment.kind,
      strategy: 'accessory_single',
      notes: 'Unpaired accessory retained'
    }
  };
}

function summarizeSession(
  context: SessionContext,
  segments: SessionSegment[]
): CompressedSessionSummary {
  const compressedDurationSeconds = segments.reduce(
    (total, segment) => total + segment.timing.totalSeconds,
    0
  );

  return {
    sessionId: context.sessionId,
    originalDurationSeconds: context.originalDurationSeconds,
    compressedDurationSeconds,
    durationDeltaSeconds: context.originalDurationSeconds - compressedDurationSeconds,
    segmentOrder: segments.map((segment) => segment.id)
  };
}

function assignOrders(segments: SessionSegment[]): SessionSegment[] {
  return segments
    .map((segment, index) => ({
      ...segment,
      order: index + 1
    }))
    .map((segment) => segment);
}

export function compressSession(
  context: SessionContext,
  options: SessionCompressionOptions
): CompressedSession {
  const config = resolveCompressionConfig(options.config);
  const telemetry: CompressionTelemetryEvent[] = [];
  const coreSegments: SessionSegment[] = [];
  const accessorySegments: SessionSegment[] = [];

  const originalIndex = new Map<string, number>();
  context.exercises.forEach((exercise, index) => {
    originalIndex.set(exercise.id, index);
  });

  const coreExercises = context.exercises.filter((exercise) => exercise.isCoreLift);
  const accessoryExercises = context.exercises.filter((exercise) => !exercise.isCoreLift);

  coreExercises.sort(
    (a, b) => (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0)
  );

  coreExercises.forEach((exercise, idx) => {
    const result = createCoreLiftSegment(exercise, idx + 1, config);
    coreSegments.push(result.segment);
    telemetry.push(result.telemetry);
  });

  const remainingAccessories = [...accessoryExercises];
  const supersetSelections = selectSupersetPairs(remainingAccessories);

  supersetSelections.forEach((selection) => {
    const result = createSupersetSegment(selection, 0, config);
    accessorySegments.push(result.segment);
    telemetry.push(result.telemetry);
    // Remove selected exercises
    const removeIds = new Set([selection.first.id, selection.second.id]);
    for (let i = remainingAccessories.length - 1; i >= 0; i -= 1) {
      if (removeIds.has(remainingAccessories[i].id)) {
        remainingAccessories.splice(i, 1);
      }
    }
  });

  // Attempt block grouping with remaining accessories (re-evaluate until insufficient exercises)
  let blockGroup: SelectedBlockGroup | null = selectBlockGroup(
    remainingAccessories,
    config.maxBlockExercises
  );
  while (blockGroup) {
    const result = createBlockSegment(blockGroup, 0, config);
    accessorySegments.push(result.segment);
    telemetry.push(result.telemetry);
    const blockIds = new Set(blockGroup.exercises.map((exercise) => exercise.id));
    for (let i = remainingAccessories.length - 1; i >= 0; i -= 1) {
      if (blockIds.has(remainingAccessories[i].id)) {
        remainingAccessories.splice(i, 1);
      }
    }
    blockGroup = selectBlockGroup(remainingAccessories, config.maxBlockExercises);
  }

  remainingAccessories.forEach((exercise) => {
    const result = createAccessorySingleSegment(exercise, 0);
    accessorySegments.push(result.segment);
    telemetry.push(result.telemetry);
  });

  const sortedAccessorySegments = accessorySegments.sort((left, right) => {
    const leftIndex = Math.min(
      ...segmentExerciseIds(left).map((id) => originalIndex.get(id) ?? Number.MAX_SAFE_INTEGER)
    );
    const rightIndex = Math.min(
      ...segmentExerciseIds(right).map((id) => originalIndex.get(id) ?? Number.MAX_SAFE_INTEGER)
    );

    return leftIndex - rightIndex;
  });

  const orderedSegments = assignOrders([...coreSegments, ...sortedAccessorySegments]);

  const summary = summarizeSession(context, orderedSegments);
  const targetSeconds = options.targetMinutes * SECONDS_PER_MINUTE;
  const telemetryWithTarget: CompressionTelemetryEvent[] = [
    ...telemetry,
    {
      segmentId: 'session',
      kind: 'session',
      strategy: 'session_summary',
      notes: `target=${targetSeconds}s compressed=${summary.compressedDurationSeconds}s`
    }
  ];

  return {
    context,
    segments: orderedSegments,
    summary,
    telemetry: telemetryWithTarget
  };
}

export function compressPlan(
  input: PlanCompressionInput,
  options: PlanCompressionOptions
): CompressionOutcome {
  const sessions = input.sessions.map((session) => compressSession(session, options));
  const compressedDurationSeconds = sessions.reduce(
    (total, session) => total + session.summary.compressedDurationSeconds,
    0
  );
  const targetSeconds = options.targetMinutes * SECONDS_PER_MINUTE;
  const meetsTimeConstraint = sessions.every(
    (session) => session.summary.compressedDurationSeconds <= targetSeconds
  );

  return {
    planId: input.planId,
    targetMinutes: options.targetMinutes,
    compressedDurationSeconds,
    sessions,
    meetsTimeConstraint
  };
}
