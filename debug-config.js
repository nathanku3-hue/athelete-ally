// 调试配置加载
require('dotenv').config();

console.log('🔍 调试配置加载');
console.log('==============');

console.log('📋 环境变量:');
console.log(`  PROFILE_DATABASE_URL: ${process.env.PROFILE_DATABASE_URL}`);
console.log(`  REDIS_URL: ${process.env.REDIS_URL}`);
console.log(`  NATS_URL: ${process.env.NATS_URL}`);

console.log('\n🧪 测试配置模块:');
try {
  const { config } = require('./services/profile-onboarding/src/config.ts');
  console.log('✅ 配置模块加载成功');
  console.log('📊 配置内容:', config);
} catch (error) {
  console.log('❌ 配置模块加载失败:', error.message);
}

console.log('\n🧪 测试数据库连接:');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.PROFILE_DATABASE_URL });

client.connect()
  .then(() => {
    console.log('✅ 数据库连接成功');
    return client.end();
  })
  .catch(err => {
    console.log('❌ 数据库连接失败:', err.message);
  });
