// 测试版profile-onboarding服务 - 使用固定端口5000
import 'dotenv/config';
import Fastify from 'fastify';
const server = Fastify({ logger: true });
// 健康检查端点
server.get('/health', async () => ({
    status: 'ok',
    service: 'profile-onboarding-test',
    port: 5000,
    timestamp: new Date().toISOString()
}));
// 根路径
server.get('/', async () => ({
    message: 'Profile Onboarding Test Service is running!',
    service: 'profile-onboarding-test',
    port: 5000,
    version: 'test-1.0'
}));
// 测试onboarding端点
server.post('/v1/onboarding', async (request, reply) => {
    const body = request.body;
    return reply.code(200).send({
        message: 'Test onboarding endpoint working!',
        status: 'success',
        userId: body.userId || 'test-user',
        port: 5000
    });
});
// 使用固定端口5000
const port = 5000;
server
    .listen({ port, host: '0.0.0.0' })
    .then(() => {
    console.log(`✅ Test Profile-onboarding service listening on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/health`);
    console.log(`✅ Root endpoint: http://localhost:${port}/`);
})
    .catch((err) => {
    console.error('❌ Failed to start test profile-onboarding service:', err);
    process.exit(1);
});
//# sourceMappingURL=index-test.js.map