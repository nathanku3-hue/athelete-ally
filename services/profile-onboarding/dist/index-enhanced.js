// 增强版profile-onboarding服务 - 逐步添加回完整功能
import 'dotenv/config';
import Fastify from 'fastify';
import { config } from './config.js';
const server = Fastify({ logger: true });
// 健康检查端点
server.get('/health', async () => ({
    status: 'ok',
    service: 'profile-onboarding',
    port: config.PORT,
    timestamp: new Date().toISOString(),
    features: {
        database: 'pending',
        eventBus: 'pending',
        fullOnboarding: 'pending'
    }
}));
// 根路径
server.get('/', async () => ({
    message: 'Profile Onboarding Service is running!',
    service: 'profile-onboarding',
    port: config.PORT,
    version: 'enhanced-1.0'
}));
// 增强的onboarding端点（添加基本验证）
server.post('/v1/onboarding', async (request, reply) => {
    try {
        const body = request.body;
        // 基本验证
        if (!body.userId) {
            return reply.code(400).send({
                error: 'userId is required',
                status: 'error'
            });
        }
        // 模拟处理逻辑
        const response = {
            message: 'Onboarding data received successfully!',
            status: 'success',
            userId: body.userId,
            timestamp: new Date().toISOString(),
            nextSteps: [
                'Database connection will be added next',
                'Event bus integration will be added next',
                'Full validation will be implemented next'
            ]
        };
        return reply.code(200).send(response);
    }
    catch (error) {
        server.log.error({ error }, 'Error processing onboarding request');
        return reply.code(500).send({
            error: 'Internal server error',
            status: 'error'
        });
    }
});
// 添加数据库状态检查端点
server.get('/status/database', async () => {
    return {
        status: 'not_connected',
        message: 'Database connection will be added in next phase',
        timestamp: new Date().toISOString()
    };
});
// 添加事件总线状态检查端点
server.get('/status/eventbus', async () => {
    return {
        status: 'not_connected',
        message: 'Event bus connection will be added in next phase',
        timestamp: new Date().toISOString()
    };
});
const port = Number(config.PORT || 5000);
server
    .listen({ port, host: '0.0.0.0' })
    .then(() => {
    console.log(`✅ Enhanced Profile-onboarding service listening on port ${port}`);
    console.log(`✅ Health check: http://localhost:${port}/health`);
    console.log(`✅ Root endpoint: http://localhost:${port}/`);
    console.log(`✅ Database status: http://localhost:${port}/status/database`);
    console.log(`✅ Event bus status: http://localhost:${port}/status/eventbus`);
})
    .catch((err) => {
    console.error('❌ Failed to start enhanced profile-onboarding service:', err);
    process.exit(1);
});
//# sourceMappingURL=index-enhanced.js.map