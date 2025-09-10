// 测试数据库认证
const { Client } = require('pg');
require('dotenv').config();

console.log('🔍 测试数据库认证');
console.log('================');

// 测试不同的连接方式
const connectionStrings = [
  'postgres://athlete:athlete@localhost:9003/profile_db',
  'postgresql://athlete:athlete@localhost:9003/profile_db',
  {
    host: 'localhost',
    port: 9003,
    database: 'profile_db',
    user: 'athlete',
    password: 'athlete'
  }
];

async function testConnection(conn, name) {
  console.log(`\n🧪 测试连接: ${name}`);
  console.log(`连接字符串: ${typeof conn === 'string' ? conn : JSON.stringify(conn)}`);
  
  const client = new Client(conn);
  
  try {
    await client.connect();
    console.log('✅ 连接成功！');
    
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log(`📊 用户: ${result.rows[0].current_user}`);
    console.log(`📊 数据库: ${result.rows[0].current_database}`);
    
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ 连接失败: ${err.message}`);
    console.log(`错误代码: ${err.code}`);
    return false;
  }
}

async function runTests() {
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], `方式 ${i + 1}`);
    if (success) {
      console.log(`\n🎉 找到可用的连接方式！`);
      break;
    }
  }
}

runTests().catch(console.error);

