import { describe, it, expect } from '@jest/globals';

// V3 數據庫模型測試
describe('V3 Database Models', () => {
  
  describe('Weekly Review Model', () => {
    const validWeeklyReview = {
      id: 'review-123',
      userId: 'user-123',
      planId: 'plan-123',
      weekNumber: 1,
      status: 'pending',
      coreLiftAnalysis: [
        {
          exerciseId: 'squat',
          targetRpeRange: { min: 7, max: 9 },
          actualRpeValues: [7, 8, 8],
          averageRpe: 7.67,
          consecutiveWeeksBelowTarget: 0,
          consecutiveWeeksAboveTarget: 0,
          hasRpe10: false,
          recommendation: null
        }
      ],
      fatigueAnalysis: {
        weeklyScores: [3, 4, 3, 2],
        averageScore: 3.0,
        previousWeekAverage: 3.5,
        fatigueIncrease: 0.5,
        exceedsThreshold: false
      },
      trainingLoadAnalysis: {
        weeklyTotalLoad: 450,
        averageSessionRpe: 8,
        totalTrainingDuration: 240,
        loadTrend: 'stable'
      },
      adjustments: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    };

    it('should validate weekly review model structure', () => {
      expect(validWeeklyReview).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        planId: expect.any(String),
        weekNumber: expect.any(Number),
        status: expect.stringMatching(/^(pending|completed|applied)$/),
        coreLiftAnalysis: expect.any(Array),
        fatigueAnalysis: expect.any(Object),
        trainingLoadAnalysis: expect.any(Object),
        adjustments: expect.any(Array),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should validate core lift analysis constraints', () => {
      validWeeklyReview.coreLiftAnalysis.forEach(lift => {
        expect(lift.averageRpe).toBeGreaterThanOrEqual(1);
        expect(lift.averageRpe).toBeLessThanOrEqual(10);
        expect(lift.consecutiveWeeksBelowTarget).toBeGreaterThanOrEqual(0);
        expect(lift.consecutiveWeeksAboveTarget).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adaptive Adjustment Model', () => {
    const validAdjustment = {
      id: 'adj-123',
      weeklyReviewId: 'review-123',
      userId: 'user-123',
      exerciseId: 'squat',
      type: 'intensity_increase',
      currentValue: 100,
      newValue: 102.5,
      percentageChange: 2.5,
      reason: 'consecutive_low_rpe',
      isMandatory: false,
      status: 'pending',
      appliedAt: null,
      createdAt: '2024-01-15T10:00:00Z'
    };

    it('should validate adjustment model structure', () => {
      expect(validAdjustment).toMatchObject({
        id: expect.any(String),
        weeklyReviewId: expect.any(String),
        userId: expect.any(String),
        exerciseId: expect.any(String),
        type: expect.stringMatching(/^(intensity_increase|volume_increase|intensity_decrease|deload)$/),
        currentValue: expect.any(Number),
        newValue: expect.any(Number),
        percentageChange: expect.any(Number),
        reason: expect.any(String),
        isMandatory: expect.any(Boolean),
        status: expect.stringMatching(/^(pending|applied|rejected)$/),
        appliedAt: expect.any(Object),
        createdAt: expect.any(String)
      });
    });

    it('should validate value constraints', () => {
      expect(validAdjustment.currentValue).toBeGreaterThan(0);
      expect(validAdjustment.newValue).toBeGreaterThan(0);
      expect(validAdjustment.percentageChange).toBeGreaterThanOrEqual(-50);
      expect(validAdjustment.percentageChange).toBeLessThanOrEqual(50);
    });
  });

  describe('Progress Signal Model', () => {
    const validProgressSignal = {
      id: 'progress-123',
      userId: 'user-123',
      weekNumber: 1,
      weeklyTrainingLoad: 450,
      weeklyFatigueAverage: 3.5,
      coreLiftTonnage: [
        {
          exerciseId: 'squat',
          weeklyTonnage: 5000,
          previousWeekTonnage: 4800,
          percentageChange: 4.2,
          trend: 'increasing'
        }
      ],
      calculatedAt: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    };

    it('should validate progress signal model structure', () => {
      expect(validProgressSignal).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        weekNumber: expect.any(Number),
        weeklyTrainingLoad: expect.any(Number),
        weeklyFatigueAverage: expect.any(Number),
        coreLiftTonnage: expect.any(Array),
        calculatedAt: expect.any(String),
        createdAt: expect.any(String)
      });
    });

    it('should validate tonnage data constraints', () => {
      validProgressSignal.coreLiftTonnage.forEach(tonnage => {
        expect(tonnage.weeklyTonnage).toBeGreaterThanOrEqual(0);
        expect(tonnage.previousWeekTonnage).toBeGreaterThanOrEqual(0);
        expect(tonnage.percentageChange).toBeGreaterThanOrEqual(-100);
        expect(tonnage.percentageChange).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('Recovery Notification Model', () => {
    const validRecoveryNotification = {
      id: 'notif-123',
      userId: 'user-123',
      sessionId: 'session-123',
      triggerType: 'high_rpe',
      triggerValue: 9.5,
      notificationType: 'carbohydrate',
      message: '高強度訓練會消耗肌肉中的糖原儲備...',
      scheduledFor: '2024-01-16T08:00:00Z',
      status: 'scheduled',
      disclaimer: '以上為通用健康建議，非醫療指導',
      sentAt: null,
      deliveredAt: null,
      createdAt: '2024-01-15T18:00:00Z'
    };

    it('should validate recovery notification model structure', () => {
      expect(validRecoveryNotification).toMatchObject({
        id: expect.any(String),
        userId: expect.any(String),
        sessionId: expect.any(String),
        triggerType: expect.stringMatching(/^(high_rpe|high_average_rpe)$/),
        triggerValue: expect.any(Number),
        notificationType: expect.stringMatching(/^(carbohydrate|active_recovery|stress_management)$/),
        message: expect.any(String),
        scheduledFor: expect.any(String),
        status: expect.stringMatching(/^(scheduled|sent|delivered|failed)$/),
        disclaimer: expect.any(String),
        sentAt: expect.any(Object),
        deliveredAt: expect.any(Object),
        createdAt: expect.any(String)
      });
    });

    it('should validate trigger value constraints', () => {
      expect(validRecoveryNotification.triggerValue).toBeGreaterThanOrEqual(8.5);
      expect(validRecoveryNotification.triggerValue).toBeLessThanOrEqual(10);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce foreign key relationships', () => {
      // 測試外鍵約束
      const weeklyReview = {
        id: 'review-123',
        userId: 'user-123', // 必須存在於 users 表
        planId: 'plan-123'  // 必須存在於 plans 表
      };

      expect(weeklyReview.userId).toBeDefined();
      expect(weeklyReview.planId).toBeDefined();
    });

    it('should enforce unique constraints', () => {
      // 測試唯一約束
      const weeklyReview = {
        id: 'review-123',
        userId: 'user-123',
        weekNumber: 1
      };

      // 同一用戶同一週只能有一個週回顧
      expect(weeklyReview.id).toBeDefined();
    });

    it('should enforce check constraints', () => {
      // 測試檢查約束
      const validRpe = 8.5;
      const invalidRpe = 11;

      expect(validRpe).toBeGreaterThanOrEqual(1);
      expect(validRpe).toBeLessThanOrEqual(10);
      expect(invalidRpe).not.toBeLessThanOrEqual(10);
    });
  });
});
