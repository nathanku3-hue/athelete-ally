import { generateTimeCrunchPreview } from '../../../time-crunch/service.js';
import type { TrainingPlan } from '../../../llm.js';
import { TimeCrunchPreviewError } from '../../../time-crunch/service.js';

const createPlan = (): TrainingPlan => {
  return {
    id: 'plan-123',
    userId: 'user-123',
    name: 'Density Builder',
    description: 'Plan with core and accessory exercises',
    duration: 4,
    microcycles: [
      {
        id: 'microcycle-1',
        weekNumber: 1,
        sessions: [
          {
            id: 'session-1',
            dayOfWeek: 1,
            name: 'Strength Day',
            duration: 60,
            exercises: [
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
                id: 'bench-press',
                name: 'Bench Press',
                isCoreLift: true,
                equipment: ['barbell'],
                primaryMuscleGroup: 'chest',
                sets: [
                  { reps: 5, restTime: 150 },
                  { reps: 5, restTime: 150 },
                  { reps: 5, restTime: 150 },
                  { reps: 5, restTime: 150 }
                ],
                restSeconds: 150
              },
              {
                id: 'db-row',
                name: 'Dumbbell Row',
                equipment: ['dumbbell'],
                primaryMuscleGroup: 'back',
                sets: 3,
                reps: 12
              },
              {
                id: 'cable-fly',
                name: 'Cable Fly',
                equipment: ['cable'],
                primaryMuscleGroup: 'chest',
                sets: 3,
                reps: 12
              }
            ]
          }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as TrainingPlan;
};

describe('generateTimeCrunchPreview', () => {
  it('produces compression outcome for a well-formed plan', () => {
    const plan = createPlan();

    const preview = generateTimeCrunchPreview(plan, 45);

    expect(preview.input.sessions).toHaveLength(1);
    expect(preview.outcome.sessions[0].segments.length).toBeGreaterThan(0);
    expect(preview.outcome.targetMinutes).toBe(45);
  });

  it('throws when plan cannot be compressed', () => {
    const plan = {
      id: 'plan-empty',
      userId: 'user-123',
      name: 'Empty Plan',
      description: 'No sessions',
      duration: 4,
      microcycles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as unknown as TrainingPlan;

    expect(() => generateTimeCrunchPreview(plan, 45)).toThrow(TimeCrunchPreviewError);
  });
});
