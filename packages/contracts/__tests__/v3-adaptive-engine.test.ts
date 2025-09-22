import { describe, it, expect } from '@jest/globals';

// V3 自適應引擎合同測試
describe('V3 Adaptive Engine Contracts', () => {
  
  describe('Weekly Review Data Contract', () => {
    const validWeeklyReviewData = {
      userId: 'user-123',
      weekNumber: 1,
      coreLifts: [
        {
          exerciseId: 'squat',
          targetRpeRange: { min: 7, max: 9 },
          actualRpeValues: [7, 8, 8],
          consecutiveWeeksBelowTarget: 0,
          consecutiveWeeksAboveTarget: 0,
          hasRpe10: false
        }
      ],
      weeklyFatigueScores: [3, 4, 3, 2],
      previousWeekFatigueAverage: 3.5,
      trainingLoad: {
        weeklyTotalLoad: 450,
        sessionRpe: 8,
        trainingDuration: 60
      }
    };

    it('should validate weekly review data structure', () => {
      expect(validWeeklyReviewData).toMatchObject({
        userId: expect.any(String),
        weekNumber: expect.any(Number),
        coreLifts: expect.arrayContaining([
          expect.objectContaining({
            exerciseId: expect.any(String),
            targetRpeRange: expect.objectContaining({
              min: expect.any(Number),
              max: expect.any(Number)
            }),
            actualRpeValues: expect.any(Array),
            consecutiveWeeksBelowTarget: expect.any(Number),
            consecutiveWeeksAboveTarget: expect.any(Number),
            hasRpe10: expect.any(Boolean)
          })
        ]),
        weeklyFatigueScores: expect.any(Array),
        previousWeekFatigueAverage: expect.any(Number),
        trainingLoad: expect.objectContaining({
          weeklyTotalLoad: expect.any(Number),
          sessionRpe: expect.any(Number),
          trainingDuration: expect.any(Number)
        })
      });
    });

    it('should validate RPE range constraints', () => {
      validWeeklyReviewData.coreLifts.forEach(lift => {
        expect(lift.targetRpeRange.min).toBeGreaterThanOrEqual(1);
        expect(lift.targetRpeRange.max).toBeLessThanOrEqual(10);
        expect(lift.targetRpeRange.min).toBeLessThanOrEqual(lift.targetRpeRange.max);
      });
    });

    it('should validate consecutive weeks counters', () => {
      validWeeklyReviewData.coreLifts.forEach(lift => {
        expect(lift.consecutiveWeeksBelowTarget).toBeGreaterThanOrEqual(0);
        expect(lift.consecutiveWeeksAboveTarget).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adaptive Adjustment Contract', () => {
  const validAdjustment = {
    adjustmentId: 'adj-123',
    userId: 'user-123',
    weekNumber: 2,
    type: 'intensity_increase',
    exerciseId: 'squat',
    currentValue: 100,
    newValue: 102.5,
    percentageChange: 2.5,
    reason: 'consecutive_low_rpe',
    isMandatory: false,
    createdAt: '2024-01-15T10:00:00Z'
  };

    it('should validate adjustment structure', () => {
      expect(validAdjustment).toMatchObject({
        adjustmentId: expect.any(String),
        userId: expect.any(String),
        weekNumber: expect.any(Number),
        type: expect.stringMatching(/^(intensity_increase|volume_increase|intensity_decrease|deload)$/),
        exerciseId: expect.any(String),
        currentValue: expect.any(Number),
        newValue: expect.any(Number),
        percentageChange: expect.any(Number),
        reason: expect.any(String),
        isMandatory: expect.any(Boolean),
        createdAt: expect.any(String)
      });
    });

    it('should validate percentage change constraints', () => {
      expect(validAdjustment.percentageChange).toBeGreaterThanOrEqual(-50);
      expect(validAdjustment.percentageChange).toBeLessThanOrEqual(50);
    });
  });

  describe('Progress Signal Contract', () => {
    const validProgressData = {
      userId: 'user-123',
      weekNumber: 1,
      weeklyTrainingLoad: 450,
      weeklyFatigueAverage: 3.5,
      coreLiftTonnage: [
        {
          exerciseId: 'squat',
          weeklyTonnage: 5000,
          previousWeekTonnage: 4800,
          percentageChange: 4.2
        }
      ],
      calculatedAt: '2024-01-15T10:00:00Z'
    };

    it('should validate progress data structure', () => {
      expect(validProgressData).toMatchObject({
        userId: expect.any(String),
        weekNumber: expect.any(Number),
        weeklyTrainingLoad: expect.any(Number),
        weeklyFatigueAverage: expect.any(Number),
        coreLiftTonnage: expect.arrayContaining([
          expect.objectContaining({
            exerciseId: expect.any(String),
            weeklyTonnage: expect.any(Number),
            previousWeekTonnage: expect.any(Number),
            percentageChange: expect.any(Number)
          })
        ]),
        calculatedAt: expect.any(String)
      });
    });
  });

  describe('Recovery Notification Contract', () => {
  const validRecoveryNotification = {
    notificationId: 'notif-123',
    userId: 'user-123',
    sessionId: 'session-123',
    triggerType: 'high_rpe',
    triggerValue: 9.5,
    notificationType: 'carbohydrate',
    message: '高強度訓練會消耗肌肉中的糖原儲備...',
    scheduledFor: '2024-01-16T08:00:00Z',
    disclaimer: '以上為通用健康建議，非醫療指導',
    createdAt: '2024-01-15T18:00:00Z'
  };

    it('should validate recovery notification structure', () => {
      expect(validRecoveryNotification).toMatchObject({
        notificationId: expect.any(String),
        userId: expect.any(String),
        sessionId: expect.any(String),
        triggerType: expect.stringMatching(/^(high_rpe|high_average_rpe)$/),
        triggerValue: expect.any(Number),
        notificationType: expect.stringMatching(/^(carbohydrate|active_recovery|stress_management)$/),
        message: expect.any(String),
        scheduledFor: expect.any(String),
        disclaimer: expect.stringContaining('非醫療指導'),
        createdAt: expect.any(String)
      });
    });

    it('should validate trigger value constraints', () => {
      expect(validRecoveryNotification.triggerValue).toBeGreaterThanOrEqual(8.5);
      expect(validRecoveryNotification.triggerValue).toBeLessThanOrEqual(10);
    });
  });
});
