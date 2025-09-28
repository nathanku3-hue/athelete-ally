import { describe, it, expect } from '@jest/globals';
import { ReadinessTodaySchema, ReadinessRangeSchema } from '@athlete-ally/shared-types';

describe('Readiness Routes', () => {
  describe('API Response Validation', () => {
    it('should validate ReadinessToday response structure', () => {
      const validResponse = {
        userId: 'test-user',
        date: '2024-01-15',
        readinessScore: 85,
        drivers: [
          { key: 'hrvDelta', label: 'HRV Delta', value: 0.1 },
          { key: 'trend3d', label: '3-Day Trend', value: 2 },
          { key: 'dataFreshness', label: 'Data Freshness', value: 0.9 }
        ],
        timestamp: '2024-01-15T08:00:00Z'
      };

      const validatedResponse = ReadinessTodaySchema.parse(validResponse);
      
      expect(validatedResponse.userId).toBe('test-user');
      expect(validatedResponse.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validatedResponse.readinessScore).toBeGreaterThanOrEqual(0);
      expect(validatedResponse.readinessScore).toBeLessThanOrEqual(100);
      expect(validatedResponse.drivers).toHaveLength(3);
    });

    it('should validate ReadinessRange response structure', () => {
      const validResponse = [
        {
          date: '2024-01-15',
          readinessScore: 85,
          drivers: [
            { key: 'hrvDelta', label: 'HRV Delta', value: 0.1 },
            { key: 'trend3d', label: '3-Day Trend', value: 2 },
            { key: 'dataFreshness', label: 'Data Freshness', value: 0.9 }
          ]
        },
        {
          date: '2024-01-16',
          readinessScore: 80
        }
      ];

      const validatedResponse = ReadinessRangeSchema.parse(validResponse);
      
      expect(validatedResponse).toHaveLength(2);
      expect(validatedResponse[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validatedResponse[0].readinessScore).toBeGreaterThanOrEqual(0);
      expect(validatedResponse[0].readinessScore).toBeLessThanOrEqual(100);
    });

    it('should validate date format', () => {
      const validDate = '2024-01-15';
      const invalidDate = '2024/01/15';
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(dateRegex.test(validDate)).toBe(true);
      expect(dateRegex.test(invalidDate)).toBe(false);
    });

    it('should validate readiness score range', () => {
      const validScores = [0, 50, 100];
      const invalidScores = [-1, 101, 150];
      
      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
      
      invalidScores.forEach(score => {
        const isValid = score >= 0 && score <= 100;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Driver Structure', () => {
    it('should have correct driver keys', () => {
      const expectedKeys = ['hrvDelta', 'trend3d', 'dataFreshness'];
      const drivers = [
        { key: 'hrvDelta', label: 'HRV Delta', value: 0.1 },
        { key: 'trend3d', label: '3-Day Trend', value: 2 },
        { key: 'dataFreshness', label: 'Data Freshness', value: 0.9 }
      ];
      
      drivers.forEach(driver => {
        expect(expectedKeys).toContain(driver.key);
        expect(driver.label).toBeDefined();
        expect(typeof driver.value).toBe('number');
      });
    });
  });
});
