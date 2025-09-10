// 简化的测试服务
require('dotenv').config();
const Fastify = require('fastify');
const { Client } = require('pg');

const server = Fastify({ logger: true });

// 直接使用环境变量
const pg = new Client({ 
  connectionString: process.env.PROFILE_DATABASE_URL 
});

server.get('/health', async () => ({ 
  status: 'ok', 
  service: 'test-simple-service',
  timestamp: new Date().toISOString()
}));

server.addHook('onReady', async () => {
  try {
    console.log('🔌 尝试连接数据库...');
    console.log('连接字符串:', process.env.PROFILE_DATABASE_URL);
    
    await pg.connect();
    console.log('✅ 数据库连接成功！');
    
    const result = await pg.query('SELECT current_user, current_database()');
    console.log('📊 数据库信息:', result.rows[0]);
    
  } catch (e) {
    console.error('❌ 数据库连接失败:', e.message);
    console.error('错误详情:', e);
    process.exit(1);
  }
});

const port = process.env.PORT || 8001;
server.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error('服务启动失败:', err);
    process.exit(1);
  }
  console.log(`🚀 测试服务启动成功: ${address}`);
});

