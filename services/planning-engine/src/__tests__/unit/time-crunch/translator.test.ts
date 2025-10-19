import { buildTimeCrunchInput } from '../../../time-crunch/index.js';
import type { TrainingPlan } from '../../../llm.js';

const createPlan = (exercises: Array<Record<string, unknown>>): TrainingPlan => {
  return {
    id: 'plan-001',
    userId: 'user-123',
    name: 'Sample Plan',
    description: 'Plan for testing translator',
    duration: 4,
    microcycles: [
      {
        id: 'microcycle-1',
        weekNumber: 1,
        sessions: [
          {
            id: 'session-1',
            dayOfWeek: 1,
            duration: 60,
            exercises
          }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as TrainingPlan;
};

describe('buildTimeCrunchInput', () => {
  it('creates session contexts with provided core lift flags', () => {
    const plan = createPlan([
      {
        id: 'back-squat',
        name: 'Back Squat',
        isCoreLift: true,
        equipment: ['barbell'],
        primaryMuscleGroup: 'quadriceps',
        sets: 4,
        reps: 5,
        restTime: 180
      },
      {
        id: 'split-squat',
        name: 'Split Squat',
        equipment: ['dumbbell'],
        primaryMuscleGroup: 'quadriceps',
        sets: 3,
        reps: 10,
        restTime: 90
      }
    ]);

    const input = buildTimeCrunchInput(plan);

    expect(input).not.toBeNull();
    if (!input) {
      throw new Error('Expected time crunch input');
    }

    expect(input.sessions).toHaveLength(1);
    const [session] = input.sessions;
    expect(session.exercises).toHaveLength(2);
    expect(session.exercises[0].isCoreLift).toBe(true);
    expect(session.exercises[1].isCoreLift).toBe(false);
    expect(session.exercises[0].sets).toHaveLength(4);
  });

  it('infers core lifts using movement name and metadata', () => {
    const plan = createPlan([
      {
        name: 'Bench Press',
        equipment: ['barbell'],
        sets: [
          { reps: 5, estimatedDurationSeconds: 50 },
          { reps: 5, estimatedDurationSeconds: 50 }
        ],
        restSeconds: 150
      },
      {
        name: 'Cable Row',
        equipment: ['cable'],
        sets: 3,
        reps: 12,
        restTime: 75
      }
    ]);

    const input = buildTimeCrunchInput(plan);

    expect(input).not.toBeNull();
    if (!input) {
      throw new Error('Expected time crunch input');
    }

    const [session] = input.sessions;
    expect(session.exercises[0].isCoreLift).toBe(true);
    expect(session.exercises[0].targetRestSeconds).toBeGreaterThanOrEqual(150);
    expect(session.exercises[0].sets).toHaveLength(2);
  });

  it('returns null when plan lacks sessions or exercises', () => {
    const plan: TrainingPlan = {
      id: 'empty',
      userId: 'user',
      name: 'Empty Plan',
      description: 'No sessions',
      duration: 4,
      microcycles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as TrainingPlan;

    expect(buildTimeCrunchInput(plan)).toBeNull();
  });
});
