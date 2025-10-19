import { PlanGenerationRequestedEvent } from '@athlete-ally/contracts';
import { toPlanGenerationRequestFromRequested } from '../../validation/plan-request.js';

describe('plan request validation', () => {
  it('preserves time-crunch target minutes when mapping events', () => {
    const event: PlanGenerationRequestedEvent = {
      eventId: 'evt-1',
      userId: 'user-123',
      timestamp: Date.now(),
      jobId: 'job-1',
      proficiency: 'intermediate',
      season: 'offseason',
      availabilityDays: 4,
      weeklyGoalDays: 4,
      equipment: ['barbell'],
      purpose: 'muscle_building',
      timeCrunchTargetMinutes: 45
    };

    const request = toPlanGenerationRequestFromRequested(event);

    expect(request.targetMinutes).toBe(45);
    expect(request.goal).toBe('hypertrophy');
  });
});
