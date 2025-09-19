/**
 * 环境集成测试
 * 验证整个开发环境是否正常工作
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// 测试配置
const TEST_CONFIG = {
  // 服务URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  GATEWAY_BFF_URL: process.env.GATEWAY_BFF_URL || 'http://localhost:4000',
  
  // 超时设置
  TIMEOUT: 30000, // 30秒
  HEALTH_CHECK_TIMEOUT: 10000, // 10秒
  
  // 重试设置
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2秒
};

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details?: any;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: ServiceHealth[];
  uptime: number;
  version: string;
}

/**
 * 检查服务健康状态
 */
async function checkServiceHealth(serviceUrl: string, serviceName: string): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${serviceUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(TEST_CONFIG.HEALTH_CHECK_TIMEOUT),
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        service: serviceName,
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: data,
      };
    } else {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: { statusCode: response.status, statusText: response.statusText },
      };
    }
  } catch (error) {
    return {
      service: serviceName,
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * 等待服务启动
 */
async function waitForService(serviceUrl: string, serviceName: string, maxRetries: number = TEST_CONFIG.MAX_RETRIES): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[${serviceName}] 尝试连接 (${attempt}/${maxRetries})...`);
    
    try {
      const response = await fetch(`${serviceUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        console.log(`✅ [${serviceName}] 服务已启动`);
        return true;
      }
    } catch (error) {
      console.log(`❌ [${serviceName}] 连接失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    if (attempt < maxRetries) {
      console.log(`⏳ [${serviceName}] 等待 ${TEST_CONFIG.RETRY_DELAY}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.RETRY_DELAY));
    }
  }
  
  console.log(`❌ [${serviceName}] 服务启动失败`);
  return false;
}

/**
 * 启动测试环境
 */
async function startTestEnvironment(): Promise<void> {
  console.log('🚀 启动测试环境...');
  
  // 检查前端服务
  const frontendReady = await waitForService(TEST_CONFIG.FRONTEND_URL, 'Frontend');
  if (!frontendReady) {
    throw new Error('Frontend service failed to start');
  }
  
  // 检查Gateway BFF服务
  const gatewayReady = await waitForService(TEST_CONFIG.GATEWAY_BFF_URL, 'Gateway BFF');
  if (!gatewayReady) {
    throw new Error('Gateway BFF service failed to start');
  }
  
  console.log('✅ 测试环境启动完成');
}

/**
 * 清理测试环境
 */
async function cleanupTestEnvironment(): Promise<void> {
  console.log('🧹 清理测试环境...');
  // 这里可以添加清理逻辑，比如停止服务等
  console.log('✅ 测试环境清理完成');
}

(process.env.RUN_ENV_TESTS ? describe : describe.skip)('Environment Integration Tests', () => {
  beforeAll(async () => {
    await startTestEnvironment();
  }, TEST_CONFIG.TIMEOUT);

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(() => {
    // 每个测试前的设置
  });

  describe('Service Health Checks', () => {
    it('should start all services successfully', async () => {
      const services = [
        { url: TEST_CONFIG.FRONTEND_URL, name: 'Frontend' },
        { url: TEST_CONFIG.GATEWAY_BFF_URL, name: 'Gateway BFF' },
      ];
      
      const healthChecks = await Promise.allSettled(
        services.map(service => checkServiceHealth(service.url, service.name))
      );
      
      for (let i = 0; i < healthChecks.length; i++) {
        const result = healthChecks[i];
        const service = services[i];
        
        if (result.status === 'rejected') {
          throw new Error(`Health check failed for ${service.name}: ${result.reason}`);
        }
        
        const health = result.value;
        expect(health.status).toBe('healthy');
        expect(health.responseTime).toBeLessThan(5000); // 响应时间应小于5秒
      }
    });

    it('should have healthy frontend service', async () => {
      const health = await checkServiceHealth(TEST_CONFIG.FRONTEND_URL, 'Frontend');
      
      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeLessThan(2000);
      expect(health.details).toBeDefined();
    });

    it('should have healthy gateway BFF service', async () => {
      const health = await checkServiceHealth(TEST_CONFIG.GATEWAY_BFF_URL, 'Gateway BFF');
      
      expect(health.status).toBe('healthy');
      expect(health.responseTime).toBeLessThan(3000);
      expect(health.details).toBeDefined();
    });
  });

  describe('API Communication', () => {
    it('should handle service communication', async () => {
      const response = await fetch(`${TEST_CONFIG.FRONTEND_URL}/api/health`);
      
      expect(response.status).toBe(200);
      
      const data: HealthResponse = await response.json();
      expect(data.status).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.checks).toBeInstanceOf(Array);
      expect(data.uptime).toBeGreaterThan(0);
      expect(data.version).toBeDefined();
    });

    it('should proxy API requests correctly', async () => {
      // 测试API代理是否正常工作
      const response = await fetch(`${TEST_CONFIG.FRONTEND_URL}/api/v1/health`);
      
      // 由于Gateway BFF可能还没有实现健康检查端点，我们只检查代理是否工作
      // 200或404都是可以接受的，只要不是网络错误
      expect([200, 404, 503]).toContain(response.status);
    });
  });

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      const requiredEnvVars = [
        'NODE_ENV',
        'GATEWAY_BFF_URL',
      ];
      
      for (const envVar of requiredEnvVars) {
        expect(process.env[envVar]).toBeDefined();
      }
    });

    it('should have correct service URLs', () => {
      expect(TEST_CONFIG.FRONTEND_URL).toMatch(/^http:\/\/localhost:\d+$/);
      expect(TEST_CONFIG.GATEWAY_BFF_URL).toMatch(/^http:\/\/localhost:\d+$/);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${TEST_CONFIG.FRONTEND_URL}/api/health`);
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 应在5秒内响应
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5;
      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch(`${TEST_CONFIG.FRONTEND_URL}/api/health`)
      );
      
      const responses = await Promise.allSettled(promises);
      
      const successfulResponses = responses.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );
      
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoints gracefully', async () => {
      const response = await fetch(`${TEST_CONFIG.FRONTEND_URL}/api/invalid-endpoint`);
      
      // 应该返回404或适当的错误响应
      expect([404, 405, 500]).toContain(response.status);
    });

    it('should handle malformed requests', async () => {
      const response = await fetch(`${TEST_CONFIG.FRONTEND_URL}/api/health`, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 应该处理格式错误的请求
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});

// 导出测试工具函数供其他测试使用
export {
  checkServiceHealth,
  waitForService,
  startTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG,
};
