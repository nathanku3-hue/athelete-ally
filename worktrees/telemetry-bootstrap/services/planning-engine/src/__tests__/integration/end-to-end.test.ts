// Jest globals are available without import
import { generateTrainingPlan, type TrainingPlanRequest } from '../../llm';

// Narrowing helpers for unknown-typed plan shapes returned by placeholder LLM implementation
type Exercise = {
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'power' | 'endurance' | 'mobility';
  sets: number;
  reps: unknown;
  weight: unknown;
};

type Session = {
  dayOfWeek: number;
  name: string;
  duration: number;
  exercises: Exercise[];
};

type Microcycle = {
  weekNumber: number;
  name: string;
  phase: 'preparation' | 'competition' | 'recovery' | 'transition';
  sessions: Session[];
};

function isExercise(x: any): x is Exercise {
  return x && typeof x.name === 'string' && typeof x.category === 'string' && typeof x.sets === 'number';
}

function isSession(x: any): x is Session {
  return (
    x && typeof x.dayOfWeek === 'number' && typeof x.name === 'string' && Array.isArray(x.exercises)
  );
}

function isMicrocycle(x: any): x is Microcycle {
  return (
    x && typeof x.weekNumber === 'number' && typeof x.name === 'string' && Array.isArray(x.sessions)
  );
}

describe.skip('End-to-End Integration Tests', () => {
  // TODO: ??ESM Prisma mock?? - ????????
  // Issue: https://github.com/nathanku3-hue/athelete-ally/issues/ci-mock-fix

  it.skip('should generate a training plan with valid schema', async () => {
    // TODO: Implement LLM integration - https://github.com/nathanku3/athelete-ally/issues/LLM_INTEGRATION
    const request: TrainingPlanRequest = {
      userId: 'test-user-123',
      proficiency: 'intermediate' as const,
      season: 'offseason' as const,
      availabilityDays: 3,
      weeklyGoalDays: 4,
      equipment: ['bodyweight', 'dumbbells'],
      purpose: 'general_fitness' as const
    };

    const plan = await generateTrainingPlan(request);

    // ??????
    expect(plan).toBeDefined();
    expect(plan.name).toBeDefined();
    expect(plan.description).toBeDefined();
    expect(plan.duration).toBeGreaterThan(0);
    expect(plan.microcycles).toBeDefined();
    expect(Array.isArray(plan.microcycles)).toBe(true);
    expect(plan.microcycles.length).toBeGreaterThan(0);

    // ????????
    const microcycles = plan.microcycles as unknown[];
    const first = microcycles[0];
    expect(isMicrocycle(first)).toBe(true);
    if (isMicrocycle(first)) {
      const firstMicrocycle = first;
      expect(firstMicrocycle.weekNumber).toBeGreaterThan(0);
      expect(firstMicrocycle.name).toBeDefined();
      expect(['preparation', 'competition', 'recovery', 'transition']).toContain(firstMicrocycle.phase);
      expect(Array.isArray(firstMicrocycle.sessions)).toBe(true);
    }

    // ???????
    if (isMicrocycle((plan.microcycles as unknown[])[0])) {
      const firstMicrocycle = (plan.microcycles as unknown[])[0] as Microcycle;
      if (firstMicrocycle.sessions.length > 0) {
        const firstSession = firstMicrocycle.sessions[0];
        expect(isSession(firstSession)).toBe(true);
        if (isSession(firstSession)) {
          expect(firstSession.dayOfWeek).toBeGreaterThanOrEqual(1);
          expect(firstSession.dayOfWeek).toBeLessThanOrEqual(7);
          expect(firstSession.name).toBeDefined();
          expect(firstSession.duration).toBeGreaterThan(0);
          expect(Array.isArray(firstSession.exercises)).toBe(true);

          if (firstSession.exercises.length > 0) {
            const firstExercise = firstSession.exercises[0];
            expect(isExercise(firstExercise)).toBe(true);
            if (isExercise(firstExercise)) {
              expect(firstExercise.name).toBeDefined();
              expect(['strength', 'cardio', 'flexibility', 'power', 'endurance', 'mobility']).toContain(firstExercise.category);
              expect(firstExercise.sets).toBeGreaterThan(0);
              expect(firstExercise.reps).toBeDefined();
              expect(firstExercise.weight).toBeDefined();
            }
          }
        }
      }
    }
  }, 30000);

  it.skip('should handle different proficiency levels', async () => {
    // TODO: Implement LLM integration - https://github.com/nathanku3/athelete-ally/issues/LLM_INTEGRATION
    const proficiencies = ['beginner', 'intermediate', 'advanced'] as const;
    
    for (const proficiency of proficiencies) {
      const request: TrainingPlanRequest = {
        userId: `test-user-${proficiency}`,
        proficiency,
        season: 'offseason' as const,
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight'],
        purpose: 'general_fitness' as const
      };

      const plan = await generateTrainingPlan(request);
      
      expect(plan).toBeDefined();
      expect(plan.name).toContain(proficiency);
      expect(plan.microcycles.length).toBeGreaterThan(0);
    }
  }, 30000);

  it.skip('should handle different equipment configurations', async () => {
    // TODO: Implement LLM integration - https://github.com/nathanku3/athelete-ally/issues/LLM_INTEGRATION
    const equipmentConfigs = [
      ['bodyweight'],
      ['bodyweight', 'dumbbells'],
      ['bodyweight', 'dumbbells', 'resistance_bands']
    ] as const;
    
    for (const equipment of equipmentConfigs) {
      const request: TrainingPlanRequest = {
        userId: `test-user-${equipment.join('-')}`,
        proficiency: 'intermediate' as const,
        season: 'offseason' as const,
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: [...equipment],
        purpose: 'general_fitness'
      };

      const plan = await generateTrainingPlan(request);
      
      expect(plan).toBeDefined();
      expect(plan.microcycles.length).toBeGreaterThan(0);
      
      // ??????????
      const mcs = plan.microcycles as unknown[];
      const allExercises = mcs
        .filter(isMicrocycle)
        .flatMap(mc => mc.sessions)
        .filter(isSession)
        .flatMap(session => session.exercises)
        .filter(isExercise);
      
      // ?????????
      expect(allExercises.length).toBeGreaterThan(0);
    }
  }, 30000);
});
