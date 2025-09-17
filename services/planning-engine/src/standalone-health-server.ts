/**
 * 🏥 独立健康检查服务器
 * 不依赖外部服务，仅提供基础健康检查功能
 */

import 'dotenv/config';
import Fastify from 'fastify';

// 创建服务器
const server = Fastify({ 
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// 基础健康检查
server.get('/health', async (request, reply) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: '1.0.0',
    service: 'planning-engine-health',
    checks: {
      server: {
        status: 'healthy',
        responseTime: 0,
        details: {
          type: 'Server',
          connection: 'active'
        }
      },
      memory: {
        status: 'healthy',
        details: {
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          usagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
        }
      }
    },
    summary: {
      total: 2,
      healthy: 2,
      unhealthy: 0,
      degraded: 0
    },
    metrics: {
      requestCount: 0,
      errorCount: 0
    }
  };
});

// 详细健康检查
server.get('/health/detailed', async (request, reply) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: '1.0.0',
    service: 'planning-engine-health',
    checks: {
      server: {
        status: 'healthy',
        responseTime: 0,
        details: {
          type: 'Server',
          connection: 'active'
        }
      },
      memory: {
        status: 'healthy',
        details: {
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          arrayBuffers: `${Math.round(memUsage.arrayBuffers / 1024 / 1024)}MB`,
          usagePercent: `${((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)}%`
        }
      }
    },
    summary: {
      total: 2,
      healthy: 2,
      unhealthy: 0,
      degraded: 0
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: uptime,
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
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '4102',
      service: process.env.SERVICE_NAME || 'planning-engine'
    }
  };
});

// 就绪检查
server.get('/health/ready', async (request, reply) => {
  return {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      server: {
        status: 'healthy',
        details: {
          type: 'Server',
          connection: 'active'
        }
      }
    }
  };
});

// 存活检查
server.get('/health/live', async (request, reply) => {
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  };
});

// 系统信息检查
server.get('/health/system', async (request, reply) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
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
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '4102',
      service: process.env.SERVICE_NAME || 'planning-engine'
    }
  };
});

// 基础路由
server.get('/', async (request, reply) => {
  return {
    service: 'planning-engine-health',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      detailed: '/health/detailed',
      ready: '/health/ready',
      live: '/health/live',
      system: '/health/system'
    },
    message: 'Planning Engine Health Check Server is running'
  };
});

// 启动服务器
const port = Number(process.env.PORT || 4102);
server
  .listen({ port, host: '0.0.0.0' })
  .then(() => {
    console.log(`🏥 Planning Engine Health Check Server listening on :${port}`);
    console.log(`🔗 Health Check: http://localhost:${port}/health`);
    console.log(`📊 Detailed: http://localhost:${port}/health/detailed`);
    console.log(`✅ Ready: http://localhost:${port}/health/ready`);
    console.log(`💓 Live: http://localhost:${port}/health/live`);
    console.log(`🖥️  System: http://localhost:${port}/health/system`);
  })
  .catch((err) => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  });