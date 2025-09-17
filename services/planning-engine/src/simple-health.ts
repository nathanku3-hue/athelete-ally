/**
 * 🏥 简化健康检查系统
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 基础健康状态监控
 * - 依赖服务检查
 * - 性能指标收集
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

export interface SimpleHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ServiceCheck;
    redis: ServiceCheck;
    memory: ServiceCheck;
  };
  metrics: {
    requestCount: number;
    errorCount: number;
  };
}

export interface ServiceCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: any;
}

export class SimpleHealthChecker {
  private prisma: PrismaClient;
  private redis: Redis;
  private startTime: number;
  private requestCount = 0;
  private errorCount = 0;

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
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

  // 获取综合健康状态
  async getHealthStatus(): Promise<SimpleHealthStatus> {
    const [database, redis, memory] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory()
    ]);

    const checks = { database, redis, memory };
    
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
        requestCount: this.requestCount,
        errorCount: this.errorCount
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
}

// 健康检查路由
export function setupSimpleHealthRoutes(fastify: FastifyInstance, healthChecker: SimpleHealthChecker) {
  // 基础健康检查
  fastify.get('/health', async (request, reply) => {
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
  fastify.get('/health/detailed', async (request, reply) => {
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
  fastify.get('/health/ready', async (request, reply) => {
    healthChecker.recordRequest();
    
    try {
      const healthStatus = await healthChecker.getHealthStatus();
      
      // 就绪检查只关注关键服务
      const criticalServices = ['database', 'redis'];
      const criticalStatus = criticalServices.every(service => 
        healthStatus.checks[service as keyof typeof healthStatus.checks].status === 'healthy'
      );
      
      if (criticalStatus) {
        return reply.status(200).send({
          status: 'ready',
          timestamp: new Date().toISOString(),
          checks: criticalServices.reduce((acc, service) => {
            acc[service] = healthStatus.checks[service as keyof typeof healthStatus.checks];
            return acc;
          }, {} as any)
        });
      } else {
        return reply.status(503).send({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Critical services not available',
          checks: criticalServices.reduce((acc, service) => {
            acc[service] = healthStatus.checks[service as keyof typeof healthStatus.checks];
            return acc;
          }, {} as any)
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
  fastify.get('/health/live', async (request, reply) => {
    healthChecker.recordRequest();
    
    return reply.status(200).send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - healthChecker['startTime']) / 1000)
    });
  });

  // 系统信息检查
  fastify.get('/health/system', async (request, reply) => {
    healthChecker.recordRequest();
    
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      return reply.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
          uptime: process.uptime(),
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
            arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)}MB`
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          service: process.env.SERVICE_NAME || 'planning-engine'
        }
      });
    } catch (error) {
      healthChecker.recordError();
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'System health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

