// 简化版profile-onboarding服务 - 暂时移除有问题的依赖
import 'dotenv/config';
import Fastify from 'fastify';
import { config } from './config.js';
const server = Fastify({ logger: true });
// 健康检查端点
server.get('/health', async () => ({
    status: 'ok',
    service: 'profile-onboarding',
    port: config.PORT,
    timestamp: new Date().toISOString()
}));
// 根路径
server.get('/', async () => ({
    message: 'Profile Onboarding Service is running!',
    service: 'profile-onboarding',
    port: config.PORT
}));
// 简化的onboarding端点（暂时不连接数据库）
server.post('/v1/onboarding', async (request, reply) => {
    return reply.code(200).send({
        message: 'Onboarding endpoint is working!',
        status: 'success',
        port: config.PORT
    });
});
const port = Number(config.PORT || 5000);
server
    .listen({ port, host: '0.0.0.0' })
    .then(() => {
    console.log(`✅ Profile-onboarding service listening on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/health`);
    console.log(`✅ Root endpoint: http://localhost:${port}/`);
})
    .catch((err) => {
    console.error('❌ Failed to start profile-onboarding service:', err);
    process.exit(1);
});
//# sourceMappingURL=index-simple.js.map