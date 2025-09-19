import { describe, it, expect } from '@jest/globals';
import { simulateApiCall } from '@contracts-test-utils/helpers';
import { ProgressDataSchema, type ProgressData } from '@athlete-ally/shared-types';

describe('Progress Endpoint Shape Lock', () => {
  it('should return weeklyData with correct shape', async () => {
    const response = await simulateApiCall<ProgressData>('GET', '/api/v3/progress/test-user');
    
    const parsed = ProgressDataSchema.safeParse(response.data);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      const weeklyData = parsed.data.weeklyData;
      expect(Array.isArray(weeklyData)).toBe(true);
      expect(weeklyData).toHaveLength(2);

      expect(weeklyData[0]).toHaveProperty('weekNumber');
      expect(weeklyData[0]).toHaveProperty('weeklyTrainingLoad');
      expect(weeklyData[1]).toHaveProperty('weekNumber');
      expect(weeklyData[1]).toHaveProperty('weeklyTrainingLoad');
      
      // Verify trends structure
      expect(parsed.data.trends).toBeDefined();
      expect(parsed.data.trends).toHaveProperty('trainingLoadTrend');
    }
  });
});
