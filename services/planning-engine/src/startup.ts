/**
 * 🚀 启动管理器
 * 统一管理服务启动和关闭流程
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { connect } from 'nats';
import { configObject } from './config/environment.js';
import { HealthChecker, setupHealthRoutes } from './health.js';
import { ErrorHandler } from './middleware/error-handler.js';
import { PerformanceMonitor } from './middleware/performance.js';

export class StartupManager {
  private app: FastifyInstance;
  private prisma: PrismaClient;
  private redis: Redis;
  private nats: any;
  private healthChecker: HealthChecker;
  private errorHandler: ErrorHandler;
  private performanceMonitor: PerformanceMonitor;

  constructor(app: FastifyInstance) {
    this.app = app;
    this.prisma = new PrismaClient();
    this.redis = new Redis(configObject.REDIS_URL);
    this.nats = null;
    this.healthChecker = new HealthChecker(this.prisma, this.redis);
    this.errorHandler = new ErrorHandler(this.app);
    this.performanceMonitor = new PerformanceMonitor(this.app);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting Athlete Ally Planning Engine...');
      
      // 1. 初始化数据库连接
      await this.initializeDatabase();
      
      // 2. 初始化Redis连接
      await this.initializeRedis();
      
      // 3. 初始化NATS连接
      await this.initializeNATS();
      
      // 4. 注册中间件
      await this.registerMiddleware();
      
      // 5. 注册路由
      await this.registerRoutes();
      
      // 6. 启动服务器
      await this.startServer();
      
      console.log('✅ Planning Engine started successfully!');
      console.log(`📊 Health check: http://localhost:${configObject.PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${configObject.PORT}/metrics`);
      console.log(`📚 API Docs: http://localhost:${configObject.PORT}/api/docs`);
      
    } catch (error) {
      console.error('❌ Failed to start Planning Engine:', error);
      process.exit(1);
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      await this.redis.ping();
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  private async initializeNATS(): Promise<void> {
    try {
      this.nats = await connect({ servers: configObject.NATS_URL });
      console.log('✅ NATS connected successfully');
    } catch (error) {
      console.error('❌ NATS connection failed:', error);
      throw error;
    }
  }

  private async registerMiddleware(): Promise<void> {
    // 注册错误处理中间件
    (this.errorHandler as any).setupErrorHandling();
    
    // 注册性能监控中间件
    (this.performanceMonitor as any).setupPerformanceMonitoring(this.app);
    
    console.log('✅ Middleware registered successfully');
  }

  private async registerRoutes(): Promise<void> {
    // 注册健康检查路由
    setupHealthRoutes(this.app, this.healthChecker);
    
    // 注册增强计划API路由
    const { enhancedPlanRoutes } = await import('./routes/enhanced-plans.js');
    await this.app.register(enhancedPlanRoutes);
    
    // 注册API文档路由
    const { default: apiDocsRoutes } = await import('./routes/api-docs.js');
    await this.app.register(apiDocsRoutes);
    
    console.log('✅ Routes registered successfully');
  }

  private async startServer(): Promise<void> {
    const port = configObject.PORT;
    const host = '0.0.0.0';
    
    await this.app.listen({ port, host });
    console.log(`✅ Server listening on http://${host}:${port}`);
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Planning Engine...');
    
    try {
      // 关闭数据库连接
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected');
      
      // 关闭Redis连接
      await this.redis.quit();
      console.log('✅ Redis disconnected');
      
      // 关闭NATS连接
      if (this.nats) {
        await this.nats.close();
        console.log('✅ NATS disconnected');
      }
      
      // 关闭服务器
      await this.app.close();
      console.log('✅ Server closed');
      
      console.log('✅ Shutdown completed successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}



