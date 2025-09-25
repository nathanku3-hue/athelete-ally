import { describe, it, expect } from '@jest/globals';
import { generateTrainingPlan } from '../../llm.js';

describe('End-to-End Integration Tests', () => {

  it('should generate a training plan with valid schema', async () => {
    const request = {
      userId: 'test-user-123',
      proficiency: 'intermediate',
      season: 'offseason',
      availabilityDays: 3,
      weeklyGoalDays: 4,
      equipment: ['bodyweight', 'dumbbells'],
      purpose: 'general_fitness'
    };

    const plan = await generateTrainingPlan(request);

    // 验证基本结构
    expect(plan).toBeDefined();
    expect(plan.name).toBeDefined();
    expect(plan.description).toBeDefined();
    expect(plan.duration).toBeGreaterThan(0);
    expect(plan.microcycles).toBeDefined();
    expect(Array.isArray(plan.microcycles)).toBe(true);
    expect(plan.microcycles.length).toBeGreaterThan(0);

    // 验证第一个微周期
    const firstMicrocycle = plan.microcycles[0];
    expect(firstMicrocycle.weekNumber).toBeGreaterThan(0);
    expect(firstMicrocycle.name).toBeDefined();
    expect(['preparation', 'competition', 'recovery', 'transition']).toContain(firstMicrocycle.phase);
    expect(Array.isArray(firstMicrocycle.sessions)).toBe(true);

    // 验证第一个会话
    if (firstMicrocycle.sessions.length > 0) {
      const firstSession = firstMicrocycle.sessions[0];
      expect(firstSession.dayOfWeek).toBeGreaterThanOrEqual(1);
      expect(firstSession.dayOfWeek).toBeLessThanOrEqual(7);
      expect(firstSession.name).toBeDefined();
      expect(firstSession.duration).toBeGreaterThan(0);
      expect(Array.isArray(firstSession.exercises)).toBe(true);

      // 验证第一个练习
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

  it('should handle different proficiency levels', async () => {
    const proficiencies = ['beginner', 'intermediate', 'advanced'];
    
    for (const proficiency of proficiencies) {
      const request = {
        userId: `test-user-${proficiency}`,
        proficiency,
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight'],
        purpose: 'general_fitness'
      };

      const plan = await generateTrainingPlan(request);
      
      expect(plan).toBeDefined();
      expect(plan.name).toContain(proficiency);
      expect(plan.microcycles.length).toBeGreaterThan(0);
    }
  }, 30000);

  it('should handle different equipment configurations', async () => {
    const equipmentConfigs = [
      ['bodyweight'],
      ['bodyweight', 'dumbbells'],
      ['bodyweight', 'dumbbells', 'resistance_bands']
    ];
    
    for (const equipment of equipmentConfigs) {
      const request = {
        userId: `test-user-${equipment.join('-')}`,
        proficiency: 'intermediate',
        season: 'offseason',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment,
        purpose: 'general_fitness'
      };

      const plan = await generateTrainingPlan(request);
      
      expect(plan).toBeDefined();
      expect(plan.microcycles.length).toBeGreaterThan(0);
      
      // 验证练习中使用的设备
      const allExercises = plan.microcycles.flatMap(mc => 
        mc.sessions.flatMap(session => session.exercises)
      );
      
      // 至少应该有一些练习
      expect(allExercises.length).toBeGreaterThan(0);
    }
  }, 30000);
});
