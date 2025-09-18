import { describe, it, expect } from '@jest/globals';

describe('OnboardingPayload Schema', () => {
  const validPayload = {
    userId: 'user-123',
    purpose: 'performance',
    proficiency: 'intermediate',
    season: 'offseason',
    availabilityDays: 3,
    weeklyGoalDays: 4,
    equipment: ['bodyweight', 'dumbbells'],
    fixedSchedules: [
      { day: 'monday', start: '18:00', end: '19:00' }
    ]
  };

  it('should accept valid payload with weeklyGoalDays', () => {
    expect(validPayload).toMatchObject({
      userId: expect.any(String),
      weeklyGoalDays: expect.any(Number)
    });
    expect(validPayload.weeklyGoalDays).toBeGreaterThanOrEqual(1);
    expect(validPayload.weeklyGoalDays).toBeLessThanOrEqual(7);
  });

  it('should validate weeklyGoalDays range', () => {
    const invalidPayloads = [
      { ...validPayload, weeklyGoalDays: 0 },
      { ...validPayload, weeklyGoalDays: 8 },
      { ...validPayload, weeklyGoalDays: -1 }
    ];

    invalidPayloads.forEach(payload => {
      const isValid = payload.weeklyGoalDays >= 1 && payload.weeklyGoalDays <= 7;
      expect(isValid).toBe(false);
    });
  });

  it('should allow weeklyGoalDays to be optional', () => {
    const payloadWithoutGoal = { ...validPayload };
    delete (payloadWithoutGoal as Record<string, unknown>).weeklyGoalDays;
    
    expect(payloadWithoutGoal).not.toHaveProperty('weeklyGoalDays');
  });
});






