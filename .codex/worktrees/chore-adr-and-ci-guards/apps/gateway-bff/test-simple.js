// test-simple.js - 最小化Fastify服务测试
import Fastify from 'fastify';

const server = Fastify({ logger: true });

// 添加简单的健康检查路由
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const port = 4000;
const host = '127.0.0.1';

console.log('🔍 Starting minimal Fastify server...');

server.listen({ port, host })
  .then(() => {
    console.log(`✅ Minimal server listening on http://${host}:${port}`);
    console.log('✅ Health check available at http://127.0.0.1:4000/health');
    
    // 检查内部状态
    console.log('🔍 Server Internal State:');
    console.log('  - Is server ready?', server.ready);
    console.log('  - Is underlying server listening?', server.server.listening);
    console.log('  - Server address:', server.server.address());
  })
  .catch((err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await server.close();
  process.exit(0);
});
