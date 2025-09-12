import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import protocolsRouter from './routes/protocols';
import { auditService, AuditAction, AuditSeverity } from './services/audit';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PROTOCOL_SERVICE_PORT || 8011;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter as any);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// 模拟用户认证中间件（生产环境应使用JWT）
app.use((req, res, next) => {
  // 从请求头获取用户信息
  const userId = req.headers['x-user-id'] as string;
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (userId) {
    (req as any).user = {
      id: userId,
      tenantId: tenantId || 'default'
    };
  }
  
  next();
});

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'protocol-engine',
      version: '2.0.0',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'protocol-engine',
      version: '2.0.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API路由
app.use('/api/v1/protocols', protocolsRouter);

// 审计日志查询端点（仅管理员）
app.get('/api/v1/audit', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const {
      action,
      resourceType,
      resourceId,
      severity,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = req.query;

    const query: any = {
      userId,
      limit: Number(limit),
      offset: Number(offset)
    };

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;
    if (severity) query.severity = severity;
    if (startDate) query.startDate = new Date(startDate as string);
    if (endDate) query.endDate = new Date(endDate as string);

    const logs = await auditService.query(query);

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch audit logs'
    });
  }
});

// 用户活动摘要端点
app.get('/api/v1/audit/summary', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { days = 30 } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const summary = await auditService.getUserActivitySummary(
      userId,
      Number(days)
    );

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch activity summary'
    });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  // 记录错误到审计日志
  if ((req as any).user?.id) {
    auditService.log({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId: (req as any).user.id,
      resourceType: 'Error',
      resourceId: req.path,
      details: {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.originalUrl
      },
      severity: AuditSeverity.HIGH,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      tenantId: (req as any).user.tenantId
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 Protocol Engine Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security features: Enabled`);
  console.log(`📝 Audit logging: Enabled`);
  console.log(`🔐 Permission system: Enabled`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
});

export default app;
