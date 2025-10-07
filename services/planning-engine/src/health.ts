/**
 * 🏥 健康检查系统
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 服务健康状态监控
 * - 依赖服务检查
 * - 性能指标收集
 * - 健康报告生成
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '../prisma/generated/client';
import { Redis } from 'ioredis';
import { NatsConnection } from 'nats';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ServiceCheck;
    redis: ServiceCheck;
    nats: ServiceCheck;
    llm: ServiceCheck;
    memory: ServiceCheck;
    disk: ServiceCheck;
  };
  metrics: {
    responseTime: number;
    requestCount: number;
    errorCount: number;
    activeConnections: number;
  };
}

export interface ServiceCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: any;
}

export class HealthChecker {
  private prisma: PrismaClient;
  private redis: Redis;
  private nats: NatsConnection;
  private startTime: number;
  private requestCount = 0;
  private errorCount = 0;

  constructor(prisma: PrismaClient, redis: Redis, nats: NatsConnection) {
    this.prisma = prisma;
    this.redis = redis;
    this.nats = nats;
    this.startTime = Date.now();
  }

  // 检查数据库连接
  async checkDatabase(): Promise<ServiceCheck> {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          connection: 'active',
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error',
        details: {
          connection: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 检查Redis连接
  async checkRedis(): Promise<ServiceCheck> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 500 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          connection: 'active',
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown Redis error',
        details: {
          connection: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 检查NATS连接
  async checkNats(): Promise<ServiceCheck> {
    const startTime = Date.now();
    
    try {
      const isConnected = this.nats.isClosed() === false;
      const responseTime = Date.now() - startTime;
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        responseTime,
        details: {
          connection: isConnected ? 'active' : 'closed',
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown NATS error',
        details: {
          connection: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 检查LLM服务
  async checkLLM(): Promise<ServiceCheck> {
    const startTime = Date.now();
    
    try {
      // 检查OpenAI API密钥
      const hasApiKey = !!process.env.OPENAI_API_KEY;
      const responseTime = Date.now() - startTime;
      
      if (!hasApiKey) {
        return {
          status: 'degraded',
          responseTime,
          error: 'OpenAI API key not configured',
          details: {
            service: 'openai',
            status: 'no_api_key',
            responseTime: `${responseTime}ms`
          }
        };
      }
      
      return {
        status: 'healthy',
        responseTime,
        details: {
          service: 'openai',
          status: 'configured',
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown LLM error',
        details: {
          service: 'openai',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 检查内存使用
  async checkMemory(): Promise<ServiceCheck> {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal;
      const usedMem = memUsage.heapUsed;
      const memUsagePercent = (usedMem / totalMem) * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (memUsagePercent < 70) {
        status = 'healthy';
      } else if (memUsagePercent < 90) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }
      
      return {
        status,
        details: {
          heapTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(usedMem / 1024 / 1024)}MB`,
          usagePercent: `${memUsagePercent.toFixed(2)}%`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown memory error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 检查磁盘空间
  async checkDisk(): Promise<ServiceCheck> {
    try {
      // 这里可以添加磁盘空间检查逻辑
      // 由于Node.js没有内置的磁盘空间检查，这里返回健康状态
      return {
        status: 'healthy',
        details: {
          status: 'available',
          note: 'Disk space check not implemented'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown disk error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // 获取综合健康状态
  async getHealthStatus(): Promise<HealthStatus> {
    const [database, redis, nats, llm, memory, disk] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkNats(),
      this.checkLLM(),
      this.checkMemory(),
      this.checkDisk()
    ]);

    const checks = { database, redis, nats, llm, memory, disk };
    
    // 确定整体状态
    const unhealthyCount = Object.values(checks).filter(check => check.status === 'unhealthy').length;
    const degradedCount = Object.values(checks).filter(check => check.status === 'degraded').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      metrics: {
        responseTime: this.getAverageResponseTime(),
        requestCount: this.requestCount,
        errorCount: this.errorCount,
        activeConnections: this.getActiveConnections()
      }
    };
  }

  // 记录请求
  recordRequest() {
    this.requestCount++;
  }

  // 记录错误
  recordError() {
    this.errorCount++;
  }

  // 获取平均响应时间
  private getAverageResponseTime(): number {
    // 这里可以实现更复杂的响应时间计算
    return 0;
  }

  // 获取活跃连接数
  private getActiveConnections(): number {
    // 这里可以实现连接数统计
    return 0;
  }
}

// 健康检查路由
export function setupHealthRoutes(fastify: FastifyInstance, healthChecker: HealthChecker) {
  // 基础健康检查
  fastify.get('/health', async (_request, reply) => {
    healthChecker.recordRequest();
    
    try {
      const healthStatus = await healthChecker.getHealthStatus();
      
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      return reply.status(statusCode).send(healthStatus);
    } catch (error) {
      healthChecker.recordError();
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 详细健康检查
  fastify.get('/health/detailed', async (_request, reply) => {
    healthChecker.recordRequest();
    
    try {
      const healthStatus = await healthChecker.getHealthStatus();
      
      // 添加更多详细信息
      const detailedStatus = {
        ...healthStatus,
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
          uptime: process.uptime()
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          service: process.env.SERVICE_NAME || 'planning-engine'
        }
      };
      
      const statusCode = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;
      
      return reply.status(statusCode).send(detailedStatus);
    } catch (error) {
      healthChecker.recordError();
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 就绪检查
  fastify.get('/health/ready', async (_request, reply) => {
    healthChecker.recordRequest();
    
    try {
      const healthStatus = await healthChecker.getHealthStatus();
      
      // 就绪检查只关注关键服务
      const criticalServices = ['database', 'redis', 'nats'];
      const criticalStatus = criticalServices.every(service => 
        healthStatus.checks[service as keyof typeof healthStatus.checks].status === 'healthy'
      );
      
      if (criticalStatus) {
        return reply.status(200).send({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        return reply.status(503).send({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Critical services not available'
        });
      }
    } catch (error) {
      healthChecker.recordError();
      return reply.status(503).send({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 存活检查
  fastify.get('/health/live', async (_request, reply) => {
    healthChecker.recordRequest();
    
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - healthChecker['startTime']) / 1000)
    });
  });
}
