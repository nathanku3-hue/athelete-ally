#!/usr/bin/env tsx

/**
 * 🔧 环境变量验证脚本
 * 作者: 后端团队
 * 版本: 1.0.0
 * 
 * 功能:
 * - 验证必需的环境变量
 * - 检查环境变量格式
 * - 提供详细的错误信息
 */

import { config } from 'dotenv';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

// 加载环境变量
config();

// 环境变量验证模式
const EnvSchema = z.object({
  // 基础配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NODE_VERSION: z.string().optional(),
  
  // 服务端口
  PORT: z.string().transform(Number).default('3000'),
  GATEWAY_BFF_PORT: z.string().transform(Number).default('4000'),
  PROFILE_ONBOARDING_PORT: z.string().transform(Number).default('4101'),
  PLANNING_ENGINE_PORT: z.string().transform(Number).default('4102'),
  EXERCISES_PORT: z.string().transform(Number).default('4103'),
  FATIGUE_PORT: z.string().transform(Number).default('4104'),
  WORKOUTS_PORT: z.string().transform(Number).default('4105'),
  ANALYTICS_PORT: z.string().transform(Number).default('4106'),
  
  // 数据库配置
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().transform(Number).default('5432'),
  POSTGRES_USER: z.string().default('athlete'),
  POSTGRES_PASSWORD: z.string().default('athlete'),
  POSTGRES_DB: z.string().default('athlete'),
  
  // 服务专用数据库
  PROFILE_DATABASE_URL: z.string().url().optional(),
  PLANNING_DATABASE_URL: z.string().url().optional(),
  EXERCISES_DATABASE_URL: z.string().url().optional(),
  FATIGUE_DATABASE_URL: z.string().url().optional(),
  WORKOUTS_DATABASE_URL: z.string().url().optional(),
  ANALYTICS_DATABASE_URL: z.string().url().optional(),
  
  // 缓存和消息队列
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  NATS_URL: z.string().url().optional(),
  NATS_HOST: z.string().default('localhost'),
  NATS_PORT: z.string().transform(Number).default('4222'),
  
  // 外部服务
  OPENAI_API_KEY: z.string().min(1).optional(),
  
  // 监控配置
  PROMETHEUS_PORT: z.string().transform(Number).default('9090'),
  GRAFANA_PORT: z.string().transform(Number).default('3001'),
  JAEGER_PORT: z.string().transform(Number).default('16686'),
  
  // 安全配置
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // 开发配置
  DEBUG: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// 端口冲突检查
function checkPortConflicts(env: z.infer<typeof EnvSchema>): string[] {
  const ports = [
    env.PORT,
    env.GATEWAY_BFF_PORT,
    env.PROFILE_ONBOARDING_PORT,
    env.PLANNING_ENGINE_PORT,
    env.EXERCISES_PORT,
    env.FATIGUE_PORT,
    env.WORKOUTS_PORT,
    env.ANALYTICS_PORT,
    env.PROMETHEUS_PORT,
    env.GRAFANA_PORT,
    env.JAEGER_PORT,
  ];
  
  const duplicates = ports.filter((port, index) => ports.indexOf(port) !== index);
  return [...new Set(duplicates)];
}

// 数据库连接字符串验证
function validateDatabaseUrls(env: z.infer<typeof EnvSchema>): string[] {
  const errors: string[] = [];
  
  const dbUrls = [
    { name: 'PROFILE_DATABASE_URL', url: env.PROFILE_DATABASE_URL },
    { name: 'PLANNING_DATABASE_URL', url: env.PLANNING_DATABASE_URL },
    { name: 'EXERCISES_DATABASE_URL', url: env.EXERCISES_DATABASE_URL },
    { name: 'FATIGUE_DATABASE_URL', url: env.FATIGUE_DATABASE_URL },
    { name: 'WORKOUTS_DATABASE_URL', url: env.WORKOUTS_DATABASE_URL },
    { name: 'ANALYTICS_DATABASE_URL', url: env.ANALYTICS_DATABASE_URL },
  ];
  
  for (const { name, url } of dbUrls) {
    if (url && !url.includes('postgresql://')) {
      errors.push(`${name} 必须是有效的 PostgreSQL 连接字符串`);
    }
  }
  
  return errors;
}

// 主验证函数
export function validateEnvironment(): {
  success: boolean;
  data?: z.infer<typeof EnvSchema>;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 验证环境变量
    const result = EnvSchema.safeParse(process.env);
    
    if (!result.success) {
      result.error.errors.forEach(error => {
        errors.push(`${error.path.join('.')}: ${error.message}`);
      });
      return { success: false, errors, warnings };
    }
    
    const env = result.data;
    
    // 检查端口冲突
    const portConflicts = checkPortConflicts(env);
    if (portConflicts.length > 0) {
      errors.push(`端口冲突: ${portConflicts.join(', ')}`);
    }
    
    // 验证数据库URL
    const dbErrors = validateDatabaseUrls(env);
    errors.push(...dbErrors);
    
    // 检查必需的外部服务配置
    if (env.NODE_ENV === 'production') {
      if (!env.OPENAI_API_KEY) {
        warnings.push('生产环境建议配置 OPENAI_API_KEY');
      }
      if (!env.JWT_SECRET) {
        errors.push('生产环境必须配置 JWT_SECRET');
      }
      if (!env.ENCRYPTION_KEY) {
        errors.push('生产环境必须配置 ENCRYPTION_KEY');
      }
    }
    
    // 检查开发环境配置
    if (env.NODE_ENV === 'development') {
      if (!env.OPENAI_API_KEY) {
        warnings.push('开发环境建议配置 OPENAI_API_KEY 以启用完整功能');
      }
    }
    
    return {
      success: errors.length === 0,
      data: env,
      errors,
      warnings
    };
    
  } catch (error) {
    errors.push(`验证过程出错: ${error instanceof Error ? error.message : '未知错误'}`);
    return { success: false, errors, warnings };
  }
}

// 命令行执行
if (require.main === module) {
  console.log('🔧 验证环境变量配置...\n');
  
  const result = validateEnvironment();
  
  if (result.success) {
    console.log('✅ 环境变量验证通过！\n');
    
    if (result.warnings.length > 0) {
      console.log('⚠️  警告:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
      console.log('');
    }
    
    console.log('📋 当前配置:');
    console.log(`   - 环境: ${result.data?.NODE_ENV}`);
    console.log(`   - 前端端口: ${result.data?.PORT}`);
    console.log(`   - 网关端口: ${result.data?.GATEWAY_BFF_PORT}`);
    console.log(`   - 数据库: ${result.data?.POSTGRES_HOST}:${result.data?.POSTGRES_PORT}`);
    console.log(`   - Redis: ${result.data?.REDIS_HOST}:${result.data?.REDIS_PORT}`);
    console.log(`   - NATS: ${result.data?.NATS_HOST}:${result.data?.NATS_PORT}`);
    
  } else {
    console.log('❌ 环境变量验证失败！\n');
    
    console.log('🚨 错误:');
    result.errors.forEach(error => console.log(`   - ${error}`));
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n💡 建议:');
    console.log('   1. 检查 .env.development 文件是否存在');
    console.log('   2. 参考 env.development.example 配置模板');
    console.log('   3. 确保所有必需的环境变量都已设置');
    
    process.exit(1);
  }
}