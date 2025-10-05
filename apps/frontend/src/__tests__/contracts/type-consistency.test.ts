/**
 * Contract Tests - API/Frontend Type Consistency
 * 
 * These tests verify that API responses match the expected frontend types
 * and that runtime validation works correctly.
 */

// Jest globals are available in test environment
import { 
  FatigueAssessmentInput,
  FatigueAssessmentResult,
  FatigueStatusResponse,
  FatigueLevel,
  Season,
  SeasonOption,
  FeedbackData,
  FeedbackType,
  FatigueAssessmentInputSchema,
  FatigueAssessmentResultSchema,
  FatigueStatusResponseSchema,
  SeasonSchema,
  SeasonOptionSchema,
  FeedbackDataSchema,
  FeedbackTypeSchema,
  safeValidateFatigueAssessmentInput,
  safeValidateFatigueAssessmentResult,
  safeValidateFatigueStatusResponse,
  safeValidateSeason,
  safeValidateFeedbackData
} from '@athlete-ally/shared-types';

describe('Contract Tests - Type Consistency', () => {
  describe('Fatigue Assessment Contract', () => {
    it('should validate correct fatigue assessment input', () => {
      const validInput: FatigueAssessmentInput = {
        sleepQuality: 7,
        stressLevel: 5,
        muscleSoreness: 6,
        energyLevel: 8,
        motivation: 7
      };

      const result = safeValidateFatigueAssessmentInput(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject invalid fatigue assessment input', () => {
      const invalidInput = {
        sleepQuality: 15, // Invalid: > 10
        stressLevel: 5,
        muscleSoreness: 6,
        energyLevel: 8,
        motivation: 7
      };

      const result = safeValidateFatigueAssessmentInput(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].path).toEqual(['sleepQuality']);
      }
    });

    it('should validate correct fatigue assessment result', () => {
      const validResult: FatigueAssessmentResult = {
        success: true,
        fatigueScore: 7.5,
        level: 'moderate' as FatigueLevel,
        message: 'Assessment completed successfully',
        timestamp: new Date().toISOString()
      };

      const result = safeValidateFatigueAssessmentResult(validResult);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validResult);
      }
    });

    it('should reject invalid fatigue level in result', () => {
      const invalidResult = {
        success: true,
        fatigueScore: 7.5,
        level: 'invalid', // Invalid: should be 'low', 'moderate', or 'high'
        message: 'Assessment completed successfully',
        timestamp: new Date().toISOString()
      };

      const result = safeValidateFatigueAssessmentResult(invalidResult);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].path).toEqual(['level']);
      }
    });

    it('should validate fatigue status response', () => {
      const validStatus: FatigueStatusResponse = {
        level: 'high' as FatigueLevel,
        score: 8.5,
        factors: [
          {
            type: 'sleep_quality',
            value: 6.5,
            impact: 'moderate',
            description: 'Poor sleep quality detected'
          }
        ],
        recommendations: [
          'Consider reducing training intensity by 10-15%',
          'Increase sleep duration by 30-60 minutes'
        ],
        lastUpdated: new Date().toISOString(),
        nextAssessment: new Date().toISOString()
      };

      const result = safeValidateFatigueStatusResponse(validStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validStatus);
      }
    });
  });

  describe('Season Contract', () => {
    it('should validate correct season values', () => {
      const validSeasons: Season[] = ['offseason', 'preseason', 'inseason'];
      
      validSeasons.forEach(season => {
        const result = safeValidateSeason(season);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(season);
        }
      });
    });

    it('should reject invalid season values', () => {
      const invalidSeasons = ['invalid', 'high', 'medium'];
      
      invalidSeasons.forEach(season => {
        const result = safeValidateSeason(season);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors).toHaveLength(1);
          expect(result.error.errors[0].path).toEqual([]);
        }
      });
    });
  });

  describe('Feedback Contract', () => {
    it('should validate correct feedback data', () => {
      const validFeedback: FeedbackData = {
        type: 'bug' as FeedbackType,
        rating: 4,
        title: 'Test feedback',
        description: 'This is a test feedback description',
        priority: 'high',
        category: 'ui',
        userEmail: 'test@example.com',
        userId: 'user123'
      };

      const result = safeValidateFeedbackData(validFeedback);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validFeedback);
      }
    });

    it('should reject invalid feedback type', () => {
      const invalidFeedback = {
        type: 'invalid-type', // Invalid: not in FeedbackType enum
        rating: 4,
        title: 'Test feedback',
        description: 'This is a test feedback description',
        priority: 'high',
        category: 'ui'
      };

      const result = safeValidateFeedbackData(invalidFeedback);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(1);
        expect(result.error.errors[0].path).toEqual(['type']);
      }
    });
  });

  describe('API Response Contract', () => {
    it('should match expected API response structure for fatigue status', async () => {
      // This would typically make an actual API call
      // For now, we'll test the expected structure
      const mockApiResponse = {
        level: 'moderate' as FatigueLevel,
        score: 6.5,
        factors: [
          {
            type: 'sleep_quality' as const,
            value: 7.0,
            impact: 'low' as const,
            description: 'Good sleep quality'
          }
        ],
        recommendations: [
          'Maintain current training intensity',
          'Continue good sleep habits'
        ],
        lastUpdated: new Date().toISOString(),
        nextAssessment: new Date().toISOString()
      };

      const result = safeValidateFatigueStatusResponse(mockApiResponse);
      expect(result.success).toBe(true);
    });

    it('should match expected API response structure for fatigue assessment', async () => {
      const mockApiResponse = {
        success: true,
        fatigueScore: 6.5,
        level: 'moderate' as FatigueLevel,
        message: 'Fatigue assessment submitted successfully',
        timestamp: new Date().toISOString()
      };

      const result = safeValidateFatigueAssessmentResult(mockApiResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Type Safety Contract', () => {
    it('should ensure FatigueLevel is consistent across all usage', () => {
      const levels: FatigueLevel[] = ['low', 'moderate', 'high'];
      
      levels.forEach(level => {
        // Test that the level can be used in all expected contexts
        const assessmentResult: FatigueAssessmentResult = {
          success: true,
          fatigueScore: 5.0,
          level,
          message: 'Test',
          timestamp: new Date().toISOString()
        };

        const statusResponse: FatigueStatusResponse = {
          level,
          score: 5.0,
          factors: [],
          recommendations: [],
          lastUpdated: new Date().toISOString(),
          nextAssessment: new Date().toISOString()
        };

        expect(assessmentResult.level).toBe(level);
        expect(statusResponse.level).toBe(level);
      });
    });

    it('should ensure Season is consistent across all usage', () => {
      const seasons: Season[] = ['offseason', 'preseason', 'inseason'];
      
      seasons.forEach(season => {
        // Test that the season can be used in onboarding context
        const onboardingData = {
          userId: 'test',
          season
        };

        expect(onboardingData.season).toBe(season);
      });
    });
  });
});

describe('Contract Tests - Runtime Validation', () => {
  it('should catch type drift at runtime', () => {
    // Simulate API returning old format
    const oldFormatResponse = {
      level: 'invalid', // Invalid format
      score: 6.5,
      factors: [],
      recommendations: [],
      lastUpdated: new Date().toISOString(),
      nextAssessment: new Date().toISOString()
    };

    const result = safeValidateFatigueStatusResponse(oldFormatResponse);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('invalid');
    }
  });

  it('should catch season format drift at runtime', () => {
    // Simulate old season format
    const oldSeasonFormat = 'off-season';
    
    const result = safeValidateSeason(oldSeasonFormat);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('off-season');
    }
  });
});
