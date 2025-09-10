// 测试数据库连接
const { Client } = require('pg');
require('dotenv').config();

console.log('🔍 测试数据库连接');
console.log('================');

const connectionString = process.env.PROFILE_DATABASE_URL;
console.log(`连接字符串: ${connectionString}`);

const client = new Client({
  connectionString: connectionString
});

client.connect()
  .then(() => {
    console.log('✅ 数据库连接成功！');
    return client.query('SELECT current_database(), current_user, version()');
  })
  .then((result) => {
    console.log('📊 数据库信息:');
    console.log(`  数据库: ${result.rows[0].current_database}`);
    console.log(`  用户: ${result.rows[0].current_user}`);
    console.log(`  版本: ${result.rows[0].version.split(' ')[0]}`);
    return client.end();
  })
  .then(() => {
    console.log('✅ 测试完成！');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ 数据库连接失败:', err.message);
    console.error('错误详情:', err);
    process.exit(1);
  });

