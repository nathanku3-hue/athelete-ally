// Jest globals are available without import
import { generateTrainingPlan } from '../../llm';

describe.skip('End-to-End Integration Tests', () => {
  // TODO: ??ESM Prisma mock?? - ????????
  // Issue: https://github.com/nathanku3-hue/athelete-ally/issues/ci-mock-fix

  it.skip('should generate a training plan with valid schema', async () => {
    // TODO: Implement LLM integration - https://github.com/nathanku3/athelete-ally/issues/LLM_INTEGRATION
    const request = {
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
    const firstMicrocycle = plan.microcycles[0] as any;
    expect(firstMicrocycle.weekNumber).toBeGreaterThan(0);
    expect(firstMicrocycle.name).toBeDefined();
    expect(['preparation', 'competition', 'recovery', 'transition']).toContain(firstMicrocycle.phase);
    expect(Array.isArray(firstMicrocycle.sessions)).toBe(true);

    // ???????
    if (firstMicrocycle.sessions.length > 0) {
      const firstSession = firstMicrocycle.sessions[0];
      expect(firstSession.dayOfWeek).toBeGreaterThanOrEqual(1);
      expect(firstSession.dayOfWeek).toBeLessThanOrEqual(7);
      expect(firstSession.name).toBeDefined();
      expect(firstSession.duration).toBeGreaterThan(0);
      expect(Array.isArray(firstSession.exercises)).toBe(true);

      // ???????
      if (firstSession.exercises.length > 0) {
        const firstExercise = firstSession.exercises[0];
        expect(firstExercise.name).toBeDefined();
        expect(['strength', 'cardio', 'flexibility', 'power', 'endurance', 'mobility']).toContain(firstExercise.category);
        expect(firstExercise.sets).toBeGreaterThan(0);
        expect(firstExercise.reps).toBeDefined();
        expect(firstExercise.weight).toBeDefined();
      }
    }
  }, 30000);

  it.skip('should handle different proficiency levels', async () => {
    // TODO: Implement LLM integration - https://github.com/nathanku3/athelete-ally/issues/LLM_INTEGRATION
    const proficiencies = ['beginner', 'intermediate', 'advanced'];
    
    for (const proficiency of ['beginner', 'intermediate', 'advanced'] as const) {
      const request = {
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
    ];
    
    for (const equipment of equipmentConfigs) {
      const request = {
        userId: `test-user-${equipment.join('-')}`,
        proficiency: 'intermediate' as const,
        season: 'offseason' as const,
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment,
        purpose: 'general_fitness' as const
      };

      const plan = await generateTrainingPlan(request);
      
      expect(plan).toBeDefined();
      expect(plan.microcycles.length).toBeGreaterThan(0);
      
      // ??????????
      const allExercises = plan.microcycles.flatMap((mc: any) => 
        mc.sessions.flatMap((session: any) => session.exercises)
      );
      
      // ?????????
      expect(allExercises.length).toBeGreaterThan(0);
    }
  }, 30000);
});
