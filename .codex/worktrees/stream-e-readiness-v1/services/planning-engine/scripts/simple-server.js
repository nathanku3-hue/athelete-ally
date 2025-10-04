// 简化的Planning Engine服务器 - 用于Phase 2验证
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PLANNING_PORT || 4102;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'planning-engine'
  });
});

// 详细健康检查
app.get('/health/detailed', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'planning-engine',
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

// 就绪检查
app.get('/health/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    message: 'Planning Engine is ready to accept requests'
  });
});

// 存活检查
app.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// 指标端点
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP planning_engine_requests_total Total number of requests
# TYPE planning_engine_requests_total counter
planning_engine_requests_total{method="GET",endpoint="/health"} 1

# HELP planning_engine_response_time_seconds Response time in seconds
# TYPE planning_engine_response_time_seconds histogram
planning_engine_response_time_seconds_bucket{le="0.1"} 1
planning_engine_response_time_seconds_bucket{le="0.5"} 1
planning_engine_response_time_seconds_bucket{le="1"} 1
planning_engine_response_time_seconds_bucket{le="+Inf"} 1
planning_engine_response_time_seconds_sum 0.05
planning_engine_response_time_seconds_count 1
  `);
});

// API文档端点
app.get('/docs', (req, res) => {
  res.json({
    title: 'Planning Engine API',
    version: '1.0.0',
    description: 'Athlete Ally Planning Engine API',
    endpoints: [
      {
        method: 'GET',
        path: '/health',
        description: 'Basic health check'
      },
      {
        method: 'GET',
        path: '/health/detailed',
        description: 'Detailed health check'
      },
      {
        method: 'GET',
        path: '/health/ready',
        description: 'Readiness check'
      },
      {
        method: 'GET',
        path: '/health/live',
        description: 'Liveness check'
      },
      {
        method: 'GET',
        path: '/metrics',
        description: 'Prometheus metrics'
      },
      {
        method: 'POST',
        path: '/v1/plans/generate',
        description: 'Generate training plan'
      }
    ]
  });
});

// 训练计划生成端点
app.post('/v1/plans/generate', (req, res) => {
  const { userId, preferences } = req.body;
  
  // 模拟计划生成
  const mockPlan = {
    id: `plan_${Date.now()}`,
    userId: userId || 'demo-user',
    name: 'Generated Training Plan',
    description: 'A comprehensive training plan generated for your goals',
    duration: 12,
    difficulty: preferences?.level || 'intermediate',
    status: 'completed',
    createdAt: new Date().toISOString(),
    content: {
      microcycles: [
        {
          weekNumber: 1,
          name: 'Foundation Week',
          phase: 'base',
          sessions: [
            {
              dayOfWeek: 1,
              name: 'Upper Body Strength',
              duration: 60,
              exercises: [
                {
                  name: 'Bench Press',
                  sets: 3,
                  reps: '8-10',
                  weight: '80% 1RM'
                },
                {
                  name: 'Pull-ups',
                  sets: 3,
                  reps: '6-8',
                  weight: 'bodyweight'
                }
              ]
            }
          ]
        }
      ]
    }
  };

  res.json({
    success: true,
    data: mockPlan,
    message: 'Training plan generated successfully'
  });
});

// 计划状态查询
app.get('/v1/plans/status', (req, res) => {
  const { jobId } = req.query;
  
  res.json({
    jobId: jobId || 'demo-job',
    status: 'completed',
    planId: `plan_${Date.now()}`,
    message: 'Plan generation completed'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Planning Engine server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
