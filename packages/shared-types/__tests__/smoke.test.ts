import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { ok, err, isOk, unwrap } from '../tests/test-utils/helpers';
import { ApiResponse } from '../tests/test-utils/types';

// Import schemas from shared-types
import { 
  OnboardingPayloadSchema,
  RPEFeedbackSchema,
  PerformanceMetricsSchema,
  EnhancedPlanGenerationRequestSchema
} from '../src/index';

describe('Shared Types Package Smoke Tests', () => {
  describe('Test Utils Integration', () => {
    it('should handle successful API responses', () => {
      const response = ok({ id: 'plan-123', status: 'generated' });
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.id).toBe('plan-123');
      }
    });

    it('should handle error API responses', () => {
      const response = err({ code: 'VALIDATION_ERROR', message: 'Invalid input' });
      expect(isOk(response)).toBe(false);
      if (!isOk(response)) {
        expect(response.error).toBeDefined();
      }
    });

    it('should unwrap successful responses', () => {
      const response = ok({ count: 100 });
      const data = unwrap(response);
      expect(data.count).toBe(100);
    });
  });

  describe('Schema Validation', () => {
    it('should validate onboarding payload', () => {
      const validPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        purpose: 'general_fitness' as const,
        purposeDetails: 'I want to get in shape',
        proficiency: 'intermediate' as const,
        season: 'offseason' as const,
        competitionDate: '2024-06-01T00:00:00Z',
        availabilityDays: 3,
        weeklyGoalDays: 4,
        equipment: ['bodyweight'],
        recoveryHabits: ['stretching']
      };

      const result = OnboardingPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
        expect(result.data.purpose).toBe('general_fitness');
      }
    });

    it('should validate RPE feedback', () => {
      const validRPE = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        sessionId: 'session-123',
        exerciseId: 'squat',
        rpe: 7,
        completionRate: 90,
        notes: 'felt good',
        timestamp: new Date().toISOString()
      };

      const result = RPEFeedbackSchema.safeParse(validRPE);
      if (!result.success) console.log('RPE Schema errors:', result.error.issues);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.rpe).toBe(7);
        expect(result.data.exerciseId).toBe('squat');
      }
    });

    it('should validate performance metrics', () => {
      const validMetrics = {
        sessionId: 'session-456',
        totalVolume: 12000,
        averageRPE: 7,
        completionRate: 95,
        recoveryTime: 24,
        sleepQuality: 7,
        stressLevel: 3,
        timestamp: new Date().toISOString()
      };

      const result = PerformanceMetricsSchema.safeParse(validMetrics);
      if (!result.success) console.log('Performance Schema errors:', result.error.issues);
      expect(result.success).toBe(true);
    });

    it('should validate enhanced plan generation request', () => {
      const validRequest = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        trainingIntent: {
          primaryGoal: 'strength',
          secondaryGoals: ['hypertrophy'],
          experienceLevel: 'intermediate',
          timeConstraints: {
            availableDays: 3,
            sessionDuration: 60,
            preferredTimes: ['morning']
          },
          equipment: ['barbell', 'dumbbells'],
          limitations: [],
          preferences: {
            intensity: 'medium',
            style: 'traditional',
            progression: 'linear'
          }
        },
        currentFitnessLevel: {
          strength: 6,
          endurance: 5,
          flexibility: 5,
          mobility: 6
        },
        injuryHistory: [],
        performanceGoals: {
          shortTerm: ['increase squat volume'],
          mediumTerm: ['5x5 progression'],
          longTerm: ['compete in meet']
        },
        feedbackHistory: [
          {
            sessionId: 'session-001',
            rpe: 7,
            completionRate: 100,
            notes: 'solid session'
          }
        ]
      };

      const result = EnhancedPlanGenerationRequestSchema.safeParse(validRequest);
      if (!result.success) console.log('Enhanced Plan Schema errors:', result.error.issues);
      expect(result.success).toBe(true);
    });
  });

  describe('Schema Rejection', () => {
    it('should reject invalid onboarding data', () => {
      const invalidPayload = {
        userId: 'invalid-id', // invalid format
        purpose: 'invalid-purpose', // not in enum
        proficiency: 'expert' // not in enum
      };

      const result = OnboardingPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should reject invalid RPE data', () => {
      const invalidRPE = {
        userId: 'user-123',
        exerciseId: 'squat',
        rpe: 15 // invalid RPE (should be 1-10)
      };

      const result = RPEFeedbackSchema.safeParse(invalidRPE);
      expect(result.success).toBe(false);
    });
  });

  describe('Package Integration', () => {
    it('should export all schemas', async () => {
      const schemas = await import('../src/index');
      expect(schemas.OnboardingPayloadSchema).toBeDefined();
      expect(schemas.RPEFeedbackSchema).toBeDefined();
      expect(schemas.PerformanceMetricsSchema).toBeDefined();
      expect(schemas.EnhancedPlanGenerationRequestSchema).toBeDefined();
    });

    it('should handle complex nested validation', () => {
      const complexData = {
        userId: 'user-123',
        plan: {
          id: 'plan-456',
          exercises: [
            {
              id: 'squat',
              sets: 3,
              reps: 10,
              weight: 100
            }
          ]
        },
        feedback: {
          overallRPE: 7,
          notes: 'Good session'
        }
      };

      // Test that we can create a response with complex data
      const response = ok(complexData);
      expect(isOk(response)).toBe(true);
      if (isOk(response)) {
        expect(response.data.userId).toBe('user-123');
      }
    });
  });
});
