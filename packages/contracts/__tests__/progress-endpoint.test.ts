import { describe, it, expect } from '@jest/globals';
import { simulateApiCall } from '@contracts-test-utils/helpers';
import { ProgressData } from '@contracts-test-utils/types';

describe('Progress Endpoint Shape Lock', () => {
  it('should return weeklyData with correct shape', async () => {
    const response = await simulateApiCall<ProgressData>('GET', '/api/v3/progress/test-user');
    
    expect(response.status).toBe(200);
    expect(response.data.weeklyData).toBeDefined();
    expect(Array.isArray(response.data.weeklyData)).toBe(true);
    expect(response.data.weeklyData).toHaveLength(2);
    
    // Verify weeklyData structure
    const weeklyData = response.data.weeklyData;
    expect(weeklyData[0]).toHaveProperty('weekNumber');
    expect(weeklyData[0]).toHaveProperty('weeklyTrainingLoad');
    expect(weeklyData[1]).toHaveProperty('weekNumber');
    expect(weeklyData[1]).toHaveProperty('weeklyTrainingLoad');
    
    // Verify trends structure
    expect(response.data.trends).toBeDefined();
    expect(response.data.trends).toHaveProperty('trainingLoadTrend');
  });
});
