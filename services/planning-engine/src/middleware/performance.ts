/**
 * 📊 性能监控中间件
 * 提供详细的性能指标和监控功能
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  errorCount: number;
  successRate: number;
  minResponseTime: number;
  maxResponseTime: number;
  lastRequestTime: number;
}

interface SystemMetrics {
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  timestamp: string;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private startTime: number = Date.now();
  private requestTimes: Map<string, number> = new Map();

  constructor(fastify: FastifyInstance) {
    this.setupPerformanceMonitoring(fastify);
  }

  private setupPerformanceMonitoring(fastify: FastifyInstance): void {
    // 请求开始时间记录
    fastify.addHook('onRequest', async (request: FastifyRequest) => {
      const requestId = this.generateRequestId(request);
      (request as any).requestId = requestId;
      (request as any).startTime = Date.now();
      this.requestTimes.set(requestId, (request as any).startTime);
    });

    // 请求结束时间记录和指标计算
    fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      const responseTime = Date.now() - (request as any).startTime;
      const route = request.routerPath || request.url;
      const requestId = (request as any).requestId;
      
      if (requestId) {
        this.requestTimes.delete(requestId);
      }
      
      this.recordMetrics(route, responseTime, reply.statusCode);
    });

    // 错误处理
    fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
      const route = request.routerPath || request.url;
      this.recordError(route);
    });

    // 性能指标端点
    fastify.get('/api/metrics/performance', async (_request, reply) => {
      const performanceData = {
        uptime: Date.now() - this.startTime,
        routes: Object.fromEntries(this.metrics),
        summary: this.getSummaryMetrics(),
        system: this.getSystemMetrics(),
        activeRequests: this.requestTimes.size
      };

      return reply.send(performanceData);
    });

    // 实时性能监控端点
    fastify.get('/api/metrics/realtime', async (_request, reply) => {
      const realtimeData = {
        timestamp: new Date().toISOString(),
        activeRequests: this.requestTimes.size,
        system: this.getSystemMetrics(),
        topRoutes: this.getTopRoutes(5)
      };

      return reply.send(realtimeData);
    });

    // 性能健康检查
    fastify.get('/api/metrics/health', async (_request, reply) => {
      const health = this.getPerformanceHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      return reply.status(statusCode).send(health);
    });
  }

  private generateRequestId(request: FastifyRequest): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordMetrics(route: string, responseTime: number, statusCode: number): void {
    const existing = this.metrics.get(route) || {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      successRate: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      lastRequestTime: 0
    };

    existing.requestCount++;
    existing.totalResponseTime += responseTime;
    existing.averageResponseTime = existing.totalResponseTime / existing.requestCount;
    existing.minResponseTime = Math.min(existing.minResponseTime, responseTime);
    existing.maxResponseTime = Math.max(existing.maxResponseTime, responseTime);
    existing.lastRequestTime = Date.now();

    if (statusCode >= 400) {
      existing.errorCount++;
    }

    existing.successRate = ((existing.requestCount - existing.errorCount) / existing.requestCount) * 100;

    this.metrics.set(route, existing);
  }

  private recordError(route: string): void {
    const existing = this.metrics.get(route);
    if (existing) {
      existing.errorCount++;
      existing.successRate = ((existing.requestCount - existing.errorCount) / existing.requestCount) * 100;
      this.metrics.set(route, existing);
    }
  }

  private getSummaryMetrics(): any {
    const allRoutes = Array.from(this.metrics.values());
    
    if (allRoutes.length === 0) {
      return {
        totalRequests: 0,
        totalErrors: 0,
        averageResponseTime: 0,
        overallSuccessRate: 0,
        minResponseTime: 0,
        maxResponseTime: 0
      };
    }

    return {
      totalRequests: allRoutes.reduce((sum, route) => sum + route.requestCount, 0),
      totalErrors: allRoutes.reduce((sum, route) => sum + route.errorCount, 0),
      averageResponseTime: allRoutes.reduce((sum, route) => sum + route.averageResponseTime, 0) / allRoutes.length,
      overallSuccessRate: allRoutes.reduce((sum, route) => sum + route.successRate, 0) / allRoutes.length,
      minResponseTime: Math.min(...allRoutes.map(route => route.minResponseTime)),
      maxResponseTime: Math.max(...allRoutes.map(route => route.maxResponseTime))
    };
  }

  private getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  private getTopRoutes(limit: number): any[] {
    return Array.from(this.metrics.entries())
      .map(([route, metrics]) => ({
        route,
        requestCount: metrics.requestCount,
        averageResponseTime: metrics.averageResponseTime,
        successRate: metrics.successRate
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, limit);
  }

  private getPerformanceHealth(): any {
    const summary = this.getSummaryMetrics();
    const system = this.getSystemMetrics();
    
    const issues = [];
    
    // 检查响应时间
    if (summary.averageResponseTime > 1000) {
      issues.push('High average response time');
    }
    
    // 检查成功率
    if (summary.overallSuccessRate < 95) {
      issues.push('Low success rate');
    }
    
    // 检查内存使用
    if (system.memory.heapUsed > 500) { // 500MB
      issues.push('High memory usage');
    }
    
    // 检查错误率
    if (summary.totalRequests > 0 && (summary.totalErrors / summary.totalRequests) > 0.05) {
      issues.push('High error rate');
    }

    const status = issues.length === 0 ? 'healthy' : 
                  issues.length <= 2 ? 'degraded' : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      issues,
      metrics: {
        averageResponseTime: summary.averageResponseTime,
        successRate: summary.overallSuccessRate,
        memoryUsage: system.memory.heapUsed,
        errorRate: summary.totalRequests > 0 ? (summary.totalErrors / summary.totalRequests) * 100 : 0
      }
    };
  }

  // 获取特定路由的性能指标
  getRouteMetrics(route: string): PerformanceMetrics | undefined {
    return this.metrics.get(route);
  }

  // 重置所有指标
  resetMetrics(): void {
    this.metrics.clear();
    this.requestTimes.clear();
    this.startTime = Date.now();
  }

  // 获取所有指标
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }
}
