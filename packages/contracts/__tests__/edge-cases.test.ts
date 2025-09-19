import { describe, it, expect } from '@jest/globals';
import { simulateServiceFailure, simulateRetryOperation, simulateApiCall } from '@contracts-test-utils/helpers';
import { ProgressDataSchema, NotificationsResponseSchema } from '@athlete-ally/shared-types';

// 回归测试：属性边界 + 失败/重试 + 空/错形数据

describe('Edge Cases & Regression', () => {
  it('simulateServiceFailure should surface error status and message', async () => {
    const res = await simulateServiceFailure<{ message: string }>();
    expect(res.status).toBe('error');
    expect(res.error).toBeDefined();
    expect(res.error.message).toBeTruthy();
  });

  it('simulateRetryOperation should not exceed max retries (sanity)', async () => {
    const res = await simulateRetryOperation<{ success: boolean }>();
    expect(typeof res.attempts).toBe('number');
    expect(res.attempts).toBeLessThanOrEqual(3);
    expect(res.data.success).toBe(true);
  });

  it('should reject malformed progress data (missing fields)', async () => {
    // 模拟错形对象（缺少 trends / weeklyData 为空）
    const malformed: any = { weeklyData: [], trends: {} };
    const parsed = ProgressDataSchema.safeParse(malformed);
    expect(parsed.success).toBe(false);
  });

  it('should accept empty notifications list and validate items when present', async () => {
    const okEmpty = { userId: 'u1', notifications: [] };
    expect(NotificationsResponseSchema.safeParse(okEmpty).success).toBe(true);

    const bad = { userId: 'u1', notifications: [{ id: 'n1', type: 'x' }] } as any; // 缺少 message/createdAt
    expect(NotificationsResponseSchema.safeParse(bad).success).toBe(false);
  });

  it('progress endpoint mock should parse valid response', async () => {
    const { data } = await simulateApiCall('GET', '/api/v3/progress/user-1');
    const parsed = ProgressDataSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.weeklyData.length).toBeGreaterThan(0);
    }
  });
});
