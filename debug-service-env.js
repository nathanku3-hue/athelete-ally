// 调试服务环境变量
require('dotenv').config();

console.log('🔍 调试服务环境变量');
console.log('==================');

// 模拟服务的环境变量加载
console.log('📋 服务启动时的环境变量:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  PORT: ${process.env.PORT}`);
console.log(`  PROFILE_DATABASE_URL: ${process.env.PROFILE_DATABASE_URL}`);
console.log(`  REDIS_URL: ${process.env.REDIS_URL}`);
console.log(`  NATS_URL: ${process.env.NATS_URL}`);

// 测试配置模块
console.log('\n🧪 测试配置模块加载:');
try {
  // 模拟服务中的导入路径
  const path = require('path');
  const configPath = path.join(__dirname, 'services', 'profile-onboarding', 'src', 'config.ts');
  console.log(`配置路径: ${configPath}`);
  
  const { config } = require(configPath);
  console.log('✅ 配置模块加载成功');
  console.log('📊 配置内容:', config);
  
  // 测试数据库连接
  console.log('\n🧪 测试数据库连接:');
  const { Client } = require('pg');
  const client = new Client({ connectionString: config.PROFILE_DATABASE_URL });
  
  client.connect()
    .then(() => {
      console.log('✅ 使用配置中的连接字符串连接成功');
      return client.end();
    })
    .catch(err => {
      console.log('❌ 使用配置中的连接字符串连接失败:', err.message);
    });
    
} catch (error) {
  console.log('❌ 配置模块加载失败:', error.message);
  console.log('错误堆栈:', error.stack);
}

