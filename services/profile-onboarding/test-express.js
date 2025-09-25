// Express替代方案测试 - 验证是否是Fastify特定问题
import express from 'express';

const app = express();

// 添加基本中间件
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'profile-onboarding-express-test',
    timestamp: new Date().toISOString(),
    port: 4000
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'Express server is running!',
    service: 'profile-onboarding-express-test'
  });
});

// 启动服务器
const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Express server is listening on http://${HOST}:${PORT}`);
  console.log(`✅ Health check: http://${HOST}:${PORT}/health`);
  console.log(`✅ Root endpoint: http://${HOST}:${PORT}/`);
});

// 错误处理
app.on('error', (err) => {
  console.error('❌ Express server error:', err);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🔄 Express server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Express server shutting down...');
  process.exit(0);
});
