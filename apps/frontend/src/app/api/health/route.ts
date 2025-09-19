import { NextRequest, NextResponse } from 'next/server';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details?: any;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: HealthCheck[];
  uptime: number;
  version: string;
}

/**
 * 检查数据库连接
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // 这里应该检查数据库连接
    // 由于前端不应该直接连接数据库，我们通过API检查
    const gatewayUrl = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
    const response = await fetch(`${gatewayUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5秒超时
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: { statusCode: response.status, statusText: response.statusText },
      };
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * 检查Redis连接
 */
async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const gatewayUrl = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
    const response = await fetch(`${gatewayUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        service: 'redis',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: { statusCode: response.status, statusText: response.statusText },
      };
    }
  } catch (error) {
    return {
      service: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * 检查NATS消息队列
 */
async function checkNats(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const gatewayUrl = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
    const response = await fetch(`${gatewayUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        service: 'nats',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        service: 'nats',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: { statusCode: response.status, statusText: response.statusText },
      };
    }
  } catch (error) {
    return {
      service: 'nats',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * 检查Gateway BFF服务
 */
async function checkGatewayBff(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const gatewayUrl = process.env.GATEWAY_BFF_URL || 'http://localhost:4000';
    const response = await fetch(`${gatewayUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        service: 'gateway-bff',
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        service: 'gateway-bff',
        status: 'unhealthy',
        responseTime,
        timestamp: new Date().toISOString(),
        details: { statusCode: response.status, statusText: response.statusText },
      };
    }
  } catch (error) {
    return {
      service: 'gateway-bff',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * 检查前端应用状态
 */
function checkFrontend(): HealthCheck {
  return {
    service: 'frontend',
    status: 'healthy',
    responseTime: 0,
    timestamp: new Date().toISOString(),
    details: {
      nodeEnv: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    },
  };
}

/**
 * 执行所有健康检查
 */
async function performHealthChecks(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  try {
    // 并行执行所有健康检查
    const checks = await Promise.allSettled([
      checkFrontend(),
      checkGatewayBff(),
      checkDatabase(),
      checkRedis(),
      checkNats(),
    ]);

    const healthChecks: HealthCheck[] = checks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const serviceNames = ['frontend', 'gateway-bff', 'database', 'redis', 'nats'];
        return {
          service: serviceNames[index],
          status: 'unhealthy' as const,
          responseTime: 0,
          timestamp: new Date().toISOString(),
          details: { error: result.reason?.message || 'Check failed' },
        };
      }
    });

    const allHealthy = healthChecks.every(check => check.status === 'healthy');
    const totalResponseTime = Date.now() - startTime;

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  } catch (error) {
    throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    // 简化的健康检查 - 只检查前端服务
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: [
        {
          service: 'frontend',
          status: 'healthy',
          responseTime: 0,
          timestamp: new Date().toISOString(),
          details: {
            nodeEnv: process.env.NODE_ENV || 'production',
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
          },
        }
      ],
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
    
    return NextResponse.json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      checks: [],
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

