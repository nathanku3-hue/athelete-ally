// 测试环境变量配置
require('dotenv').config();

console.log('🔍 测试声明式环境配置');
console.log('================================');

// 检查基础配置
console.log('📋 基础配置:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);

// 检查服务端口
console.log('\n🚀 服务端口配置:');
console.log(`  GATEWAY_BFF_PORT: ${process.env.GATEWAY_BFF_PORT}`);
console.log(`  PROFILE_ONBOARDING_PORT: ${process.env.PROFILE_ONBOARDING_PORT}`);
console.log(`  PLANNING_ENGINE_PORT: ${process.env.PLANNING_ENGINE_PORT}`);
console.log(`  WORKOUTS_PORT: ${process.env.WORKOUTS_PORT}`);
console.log(`  FATIGUE_PORT: ${process.env.FATIGUE_PORT}`);
console.log(`  EXERCISES_PORT: ${process.env.EXERCISES_PORT}`);

// 检查基础设施端口
console.log('\n🏗️ 基础设施端口配置:');
console.log(`  NATS_PORT: ${process.env.NATS_PORT}`);
console.log(`  REDIS_PORT: ${process.env.REDIS_PORT}`);
console.log(`  POSTGRES_PORT: ${process.env.POSTGRES_PORT}`);

// 检查监控端口
console.log('\n📊 监控端口配置:');
console.log(`  PROMETHEUS_PORT: ${process.env.PROMETHEUS_PORT}`);
console.log(`  GRAFANA_PORT: ${process.env.GRAFANA_PORT}`);
console.log(`  JAEGER_PORT: ${process.env.JAEGER_PORT}`);

// 检查数据库连接
console.log('\n🗄️ 数据库连接配置:');
console.log(`  POSTGRES_USER: ${process.env.POSTGRES_USER}`);
console.log(`  POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD}`);
console.log(`  POSTGRES_DB: ${process.env.POSTGRES_DB}`);
console.log(`  PROFILE_DATABASE_URL: ${process.env.PROFILE_DATABASE_URL}`);
console.log(`  PLANNING_DATABASE_URL: ${process.env.PLANNING_DATABASE_URL}`);

// 检查基础设施连接
console.log('\n🔗 基础设施连接配置:');
console.log(`  REDIS_URL: ${process.env.REDIS_URL}`);
console.log(`  NATS_URL: ${process.env.NATS_URL}`);

// 检查服务间通信
console.log('\n🌐 服务间通信配置:');
console.log(`  PROFILE_ONBOARDING_URL: ${process.env.PROFILE_ONBOARDING_URL}`);
console.log(`  PLANNING_ENGINE_URL: ${process.env.PLANNING_ENGINE_URL}`);

console.log('\n✅ 环境变量配置测试完成！');

