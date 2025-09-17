// 前端端到端测试 - API集成测试
import { APITestUtils } from '@/lib/api-test-utils';

// 测试用的训练计划数据
const mockTrainingPlan = {
  id: 'plan_123',
  name: '力量训练计划',
  description: '适合中级训练者的力量训练计划',
  difficulty: 'intermediate',
  duration: 60,
  exercises: [
    {
      id: 'ex_1',
      name: '深蹲',
      sets: 3,
      reps: 10,
      weight: 100,
      restTime: 120
    },
    {
      id: 'ex_2',
      name: '卧推',
      sets: 3,
      reps: 8,
      weight: 80,
      restTime: 120
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('前端端到端测试', () => {
  // 设置测试超时
  jest.setTimeout(30000);

  describe('API集成测试', () => {
    test('应该完成完整的训练计划流程', async () => {
      const results = await APITestUtils.testAllEndpoints();

      expect(results).toBeDefined();
      expect(Object.keys(results).length).toBeGreaterThan(0);

      // 生成测试报告
      const report = APITestUtils.generateTestReport(results);
      console.log(report);

      // 至少健康检查应该通过
      expect(results.healthCheck?.success).toBe(true);
    });

    test('应该处理API成功响应', async () => {
      // 模拟API成功响应
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockTrainingPlan
        })
      });

      const result = await APITestUtils.testPlanGeneration('test_user', {
        goal: 'strength',
        experience: 'intermediate'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planId).toBeDefined();
      expect(result.data?.name).toBeDefined();
    });

    test('应该处理API错误响应', async () => {
      // 模拟API错误响应
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: 'Invalid request'
        })
      });

      const result = await APITestUtils.testPlanGeneration('test_user', {
        goal: 'invalid',
        experience: 'invalid'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.status).toBe(400);
    });

    test('应该处理网络错误', async () => {
      // 模拟网络错误
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await APITestUtils.testPlanGeneration('test_user', {
        goal: 'strength',
        experience: 'intermediate'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.status).toBe(0);
    });
  });

  describe('性能测试', () => {
    test('API响应时间应该在合理范围内', async () => {
      const startTime = Date.now();
      const result = await APITestUtils.testHealthCheck();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(result).toBeDefined();
      expect(responseTime).toBeLessThan(5000); // 5秒内响应
    });

    test('并发请求应该正常工作', async () => {
      const promises = Array(5).fill(null).map(() => 
        APITestUtils.testHealthCheck()
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(APITestUtils.validateAPIResponse(result)).toBe(true);
      });
    });
  });

  describe('错误处理测试', () => {
    test('应该优雅处理网络错误', async () => {
      // 模拟网络错误
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await APITestUtils.testHealthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');

      // 恢复原始fetch
      global.fetch = originalFetch;
    });

    test('应该优雅处理服务器错误', async () => {
      // 模拟服务器错误
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal server error' })
      });

      const result = await APITestUtils.testHealthCheck();

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.status).toBe(500);

      // 恢复原始fetch
      global.fetch = originalFetch;
    });
  });

  describe('数据验证测试', () => {
    test('应该验证API响应格式', () => {
      const validResponse = {
        success: true,
        data: { test: 'data' },
        status: 200
      };

      const invalidResponse = {
        success: 'true', // 应该是boolean
        data: { test: 'data' },
        status: '200' // 应该是number
      };

      expect(APITestUtils.validateAPIResponse(validResponse)).toBe(true);
      expect(APITestUtils.validateAPIResponse(invalidResponse as any)).toBe(false);
    });

    test('应该验证必需字段', () => {
      const response = {
        success: true,
        data: { test: 'data' },
        status: 200
      };

      expect(APITestUtils.validateAPIResponse(response, ['success', 'status'])).toBe(true);
      expect(APITestUtils.validateAPIResponse(response, ['success', 'status', 'missing'])).toBe(false);
    });
  });
});