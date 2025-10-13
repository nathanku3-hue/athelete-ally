import { compressSession, type SessionWithExercises } from '../../time-crunch/compressor.js';

function buildSession(): SessionWithExercises {
  return {
    id: 'session-1',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    microcycleId: 'microcycle-1',
    dayOfWeek: 1,
    name: 'Strength Day',
    duration: 60,
    isTimeCrunchActive: false,
    timeCrunchMinutes: null,
    timeCrunchAppliedAt: null,
    compressedPlan: null,
    compressionDiff: null,
    compressionSummary: null,
    exercises: [
      {
        id: 'ex-1',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        sessionId: 'session-1',
        name: 'Back Squat',
        category: 'strength',
        sets: 4,
        reps: '6',
        weight: '75% 1RM',
        notes: 'Core lift',
        order: 0,
      },
      {
        id: 'ex-2',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        sessionId: 'session-1',
        name: 'Bench Press',
        category: 'strength',
        sets: 4,
        reps: '8',
        weight: '70% 1RM',
        notes: null,
        order: 1,
      },
      {
        id: 'ex-3',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        sessionId: 'session-1',
        name: 'Dumbbell Row',
        category: 'strength',
        sets: 3,
        reps: '10',
        weight: 'RPE 8',
        notes: 'Accessory pull',
        order: 2,
      },
      {
        id: 'ex-4',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        sessionId: 'session-1',
        name: 'Band Mobility',
        category: 'mobility',
        sets: 3,
        reps: '30s',
        weight: null,
        notes: 'Mobility and activation',
        order: 3,
      },
    ],
  };
}

const baseSession = buildSession();
  id: 'session-1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  microcycleId: 'microcycle-1',
  dayOfWeek: 1,
  name: 'Strength Day',
  duration: 60,
  isTimeCrunchActive: false,
  timeCrunchMinutes: null,
  timeCrunchAppliedAt: null,
  compressedPlan: null,
  compressionDiff: null,
  compressionSummary: null,
  exercises: [
    {
      id: 'ex-1',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      sessionId: 'session-1',
      name: 'Back Squat',
      category: 'strength',
      sets: 4,
      reps: '6',
      weight: '75% 1RM',
      notes: 'Core lift',
      order: 0,
    },
    {
      id: 'ex-2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      sessionId: 'session-1',
      name: 'Bench Press',
      category: 'strength',
      sets: 4,
      reps: '8',
      weight: '70% 1RM',
      notes: null,
      order: 1,
    },
    {
      id: 'ex-3',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      sessionId: 'session-1',
      name: 'Dumbbell Row',
      category: 'strength',
      sets: 3,
      reps: '10',
      weight: 'RPE 8',
      notes: 'Accessory pull',
      order: 2,
    },
    {
      id: 'ex-4',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      sessionId: 'session-1',
      name: 'Band Mobility',
      category: 'mobility',
      sets: 3,
      reps: '30s',
      weight: null,
      notes: 'Mobility and activation',
      order: 3,
    },
  ],
};

describe('compressSession', () => {
  it('removes low-priority accessories to meet Target minutes', () => {
    const result = compressSession(buildSession(), 40);

    expect(result.compressedSession.isTimeCrunchActive).toBe(true);
    expect(result.diff.removedExercises).toHaveLength(1);
    expect(result.diff.removedExercises[0]?.name).toBe('Band Mobility');
    expect(result.diff.reducedExercises.length).toBeGreaterThanOrEqual(1);
    expect(result.diff.targetDuration).toBe(40);
    expect(result.diff.achievedDuration).toBeLessThanOrEqual(45);
    expect(result.summary).toContain('Targeted 40 minutes');
  });

  it('returns unchanged when already below target', () => {
    const quickSession = buildSession();
    quickSession.duration = 35;

    const result = compressSession(quickSession, 50);

    expect(result.compressedSession.isTimeCrunchActive).toBe(false);
    expect(result.diff.totalMinutesSaved).toBe(0);
    expect(result.diff.achievedDuration).toBe(result.diff.originalDuration);
    expect(result.diff.removedExercises).toHaveLength(0);
    expect(result.diff.reducedExercises).toHaveLength(0);
  });
});
