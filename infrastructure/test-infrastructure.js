#!/usr/bin/env node

// 基础设施测试脚本
// 用于验证所有基础设施组件的功能

const Redis = require('ioredis');
const axios = require('axios');
const { Client } = require('pg');

// 测试配置
const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  vault: {
    url: process.env.VAULT_URL || 'http://localhost:8200',
    token: process.env.VAULT_TOKEN || 'athlete-ally-root-token',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'athlete_ally_user',
    password: process.env.DB_PASSWORD || 'athlete_ally_password',
    database: process.env.DB_NAME || 'athlete_ally_main',
  },
};

// 测试结果
const testResults = {
  redis: { status: 'pending', details: [] },
  vault: { status: 'pending', details: [] },
  database: { status: 'pending', details: [] },
  rls: { status: 'pending', details: [] },
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Redis 测试
async function testRedis() {
  log('\n🔍 测试 Redis 缓存层...', 'blue');
  
  try {
    const redis = new Redis(config.redis);
    
    // 连接测试
    const pong = await redis.ping();
    if (pong === 'PONG') {
      testResults.redis.details.push('✅ 连接成功');
    } else {
      throw new Error('Ping 响应异常');
    }
    
    // 基本操作测试
    await redis.set('test:key', 'test:value', 'EX', 60);
    const value = await redis.get('test:key');
    if (value === 'test:value') {
      testResults.redis.details.push('✅ 基本操作正常');
    } else {
      throw new Error('数据读写异常');
    }
    
    // 哈希操作测试
    await redis.hset('test:hash', 'field1', 'value1');
    const hashValue = await redis.hget('test:hash', 'field1');
    if (hashValue === 'value1') {
      testResults.redis.details.push('✅ 哈希操作正常');
    } else {
      throw new Error('哈希操作异常');
    }
    
    // 列表操作测试
    await redis.lpush('test:list', 'item1', 'item2');
    const listLength = await redis.llen('test:list');
    if (listLength === 2) {
      testResults.redis.details.push('✅ 列表操作正常');
    } else {
      throw new Error('列表操作异常');
    }
    
    // 性能测试
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      await redis.set(`perf:test:${i}`, `value${i}`);
    }
    const duration = Date.now() - start;
    testResults.redis.details.push(`✅ 性能测试: 1000次操作耗时 ${duration}ms`);
    
    // 清理测试数据
    await redis.del('test:key', 'test:hash', 'test:list');
    for (let i = 0; i < 1000; i++) {
      await redis.del(`perf:test:${i}`);
    }
    
    await redis.quit();
    testResults.redis.status = 'passed';
    log('✅ Redis 测试通过', 'green');
    
  } catch (error) {
    testResults.redis.status = 'failed';
    testResults.redis.details.push(`❌ 错误: ${error.message}`);
    log(`❌ Redis 测试失败: ${error.message}`, 'red');
  }
}

// Vault 测试
async function testVault() {
  log('\n🔍 测试 Vault 密钥管理...', 'blue');
  
  try {
    // 健康检查
    const healthResponse = await axios.get(`${config.vault.url}/v1/sys/health`);
    if (healthResponse.status === 200) {
      testResults.vault.details.push('✅ 健康检查通过');
    } else {
      throw new Error('健康检查失败');
    }
    
    // 状态检查
    const statusResponse = await axios.get(`${config.vault.url}/v1/sys/status`, {
      headers: { 'X-Vault-Token': config.vault.token },
    });
    
    if (statusResponse.data.initialized) {
      testResults.vault.details.push('✅ Vault 已初始化');
    } else {
      throw new Error('Vault 未初始化');
    }
    
    if (!statusResponse.data.sealed) {
      testResults.vault.details.push('✅ Vault 已解封');
    } else {
      throw new Error('Vault 已封存');
    }
    
    // 启用密钥引擎
    try {
      await axios.post(`${config.vault.url}/v1/sys/mounts/athlete-ally`, {
        type: 'kv-v2',
        description: 'Athlete Ally secrets',
      });
      testResults.vault.details.push('✅ 密钥引擎已启用');
    } catch (error) {
      if (error.response?.status === 400) {
        testResults.vault.details.push('ℹ️ 密钥引擎已存在');
      } else {
        throw error;
      }
    }
    
    // 写入密钥测试
    await axios.post(`${config.vault.url}/v1/athlete-ally/test`, {
      data: { test_key: 'test_value' },
    }, {
      headers: { 'X-Vault-Token': config.vault.token },
    });
    testResults.vault.details.push('✅ 密钥写入成功');
    
    // 读取密钥测试
    const readResponse = await axios.get(`${config.vault.url}/v1/athlete-ally/test`, {
      headers: { 'X-Vault-Token': config.vault.token },
    });
    
    if (readResponse.data.data.test_key === 'test_value') {
      testResults.vault.details.push('✅ 密钥读取成功');
    } else {
      throw new Error('密钥读取异常');
    }
    
    // 删除测试密钥
    await axios.delete(`${config.vault.url}/v1/athlete-ally/test`, {
      headers: { 'X-Vault-Token': config.vault.token },
    });
    testResults.vault.details.push('✅ 密钥删除成功');
    
    testResults.vault.status = 'passed';
    log('✅ Vault 测试通过', 'green');
    
  } catch (error) {
    testResults.vault.status = 'failed';
    testResults.vault.details.push(`❌ 错误: ${error.message}`);
    log(`❌ Vault 测试失败: ${error.message}`, 'red');
  }
}

// 数据库测试
async function testDatabase() {
  log('\n🔍 测试 PostgreSQL 数据库...', 'blue');
  
  let client;
  
  try {
    client = new Client(config.database);
    await client.connect();
    testResults.database.details.push('✅ 数据库连接成功');
    
    // 基本查询测试
    const result = await client.query('SELECT version()');
    if (result.rows.length > 0) {
      testResults.database.details.push('✅ 基本查询正常');
    } else {
      throw new Error('查询结果异常');
    }
    
    // 表存在性检查
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'protocols', 'protocol_shares')
    `);
    
    if (tableCheck.rows.length >= 3) {
      testResults.database.details.push('✅ 核心表存在');
    } else {
      throw new Error('核心表缺失');
    }
    
    // 索引检查
    const indexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('users', 'protocols', 'protocol_shares')
    `);
    
    if (indexCheck.rows.length > 0) {
      testResults.database.details.push('✅ 索引已创建');
    } else {
      testResults.database.details.push('⚠️ 索引可能缺失');
    }
    
    // 性能测试
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      await client.query('SELECT 1');
    }
    const duration = Date.now() - start;
    testResults.database.details.push(`✅ 性能测试: 100次查询耗时 ${duration}ms`);
    
    testResults.database.status = 'passed';
    log('✅ 数据库测试通过', 'green');
    
  } catch (error) {
    testResults.database.status = 'failed';
    testResults.database.details.push(`❌ 错误: ${error.message}`);
    log(`❌ 数据库测试失败: ${error.message}`, 'red');
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// RLS 策略测试
async function testRLS() {
  log('\n🔍 测试 RLS 策略...', 'blue');
  
  let client;
  
  try {
    client = new Client(config.database);
    await client.connect();
    
    // 检查 RLS 是否启用
    const rlsCheck = await client.query(`
      SELECT tablename, relrowsecurity 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE t.schemaname = 'public'
      AND t.tablename IN ('users', 'protocols', 'protocol_shares')
    `);
    
    const enabledTables = rlsCheck.rows.filter(row => row.relrowsecurity);
    if (enabledTables.length >= 3) {
      testResults.rls.details.push('✅ RLS 已启用');
    } else {
      throw new Error('RLS 未完全启用');
    }
    
    // 检查策略数量
    const policyCheck = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public'
      GROUP BY tablename
    `);
    
    if (policyCheck.rows.length > 0) {
      testResults.rls.details.push('✅ 策略已创建');
    } else {
      throw new Error('策略未创建');
    }
    
    // 测试权限函数
    const functionCheck = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname IN ('current_user_id', 'has_permission', 'check_rls_status')
    `);
    
    if (functionCheck.rows.length >= 3) {
      testResults.rls.details.push('✅ 权限函数已创建');
    } else {
      throw new Error('权限函数缺失');
    }
    
    // 测试用户权限视图
    const viewCheck = await client.query(`
      SELECT * FROM user_permissions LIMIT 1
    `);
    testResults.rls.details.push('✅ 权限视图正常');
    
    // 测试 RLS 状态检查
    const statusCheck = await client.query('SELECT * FROM check_rls_status()');
    if (statusCheck.rows.length > 0) {
      testResults.rls.details.push('✅ RLS 状态检查正常');
    } else {
      throw new Error('RLS 状态检查异常');
    }
    
    testResults.rls.status = 'passed';
    log('✅ RLS 策略测试通过', 'green');
    
  } catch (error) {
    testResults.rls.status = 'failed';
    testResults.rls.details.push(`❌ 错误: ${error.message}`);
    log(`❌ RLS 策略测试失败: ${error.message}`, 'red');
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// 生成测试报告
function generateReport() {
  log('\n📊 生成测试报告...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 4,
      passed: Object.values(testResults).filter(r => r.status === 'passed').length,
      failed: Object.values(testResults).filter(r => r.status === 'failed').length,
    },
    results: testResults,
  };
  
  // 保存报告
  require('fs').writeFileSync(
    'infrastructure-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  // 显示摘要
  log('\n📋 测试摘要:', 'bold');
  log(`总测试数: ${report.summary.total}`, 'blue');
  log(`通过: ${report.summary.passed}`, 'green');
  log(`失败: ${report.summary.failed}`, 'red');
  
  // 显示详细结果
  Object.entries(testResults).forEach(([component, result]) => {
    log(`\n${component.toUpperCase()}:`, 'bold');
    result.details.forEach(detail => {
      log(`  ${detail}`);
    });
  });
  
  return report.summary.failed === 0;
}

// 主函数
async function main() {
  log('🚀 开始基础设施测试...', 'bold');
  
  try {
    await testRedis();
    await testVault();
    await testDatabase();
    await testRLS();
    
    const success = generateReport();
    
    if (success) {
      log('\n🎉 所有测试通过！基础设施部署成功！', 'green');
      process.exit(0);
    } else {
      log('\n❌ 部分测试失败，请检查配置！', 'red');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 测试过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { testRedis, testVault, testDatabase, testRLS };
