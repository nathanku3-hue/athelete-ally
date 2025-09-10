// 调试环境变量加载
require('dotenv').config();

console.log('🔍 调试环境变量加载');
console.log('==================');

console.log('📋 关键环境变量:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  PORT: ${process.env.PORT}`);
console.log(`  PROFILE_DATABASE_URL: ${process.env.PROFILE_DATABASE_URL}`);
console.log(`  REDIS_URL: ${process.env.REDIS_URL}`);

console.log('\n🧪 测试 Zod 验证:');
const { z } = require('zod');

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform((v) => Number(v)).default('8001'),
  PROFILE_DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
});

const result = EnvSchema.safeParse(process.env);
if (result.success) {
  console.log('✅ 环境变量验证通过');
  console.log('📊 解析结果:', result.data);
} else {
  console.log('❌ 环境变量验证失败');
  console.log('错误详情:', result.error.flatten());
}

