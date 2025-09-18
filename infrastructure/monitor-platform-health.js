#!/usr/bin/env node

// 平台健康监控脚本
// 用于实时监控基础设施性能和稳定性

const Redis = require('ioredis');
const axios = require('axios');
const { Client } = require('pg');

// 监控配置
const config = {
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'YOUR_REDIS_PASSWORD',
    db: 0,
  },
  vault: {
    url: 'http://localhost:8201',
    token: 'athlete-ally-root-token',
  },
  database: {
    host: 'localhost',
    port: 5432,
    user: 'athlete',
    password: 'athlete',
    database: 'athlete_ally_main',
  },
};

// 监控指标
const metrics = {
  redis: {
    connected: false,
    memoryUsage: 0,
    connectedClients: 0,
    operationsPerSecond: 0,
    latency: 0,
  },
  vault: {
    connected: false,
    initialized: false,
    sealed: false,
    version: '',
  },
  database: {
    connected: false,
    activeConnections: 0,
    maxConnections: 0,
    queryTime: 0,
  },
  overall: {
    status: 'unknown',
    timestamp: new Date().toISOString(),
  },
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

// Redis 监控
async function monitorRedis() {
  try {
    const redis = new Redis(config.redis);
    
    // 连接测试
    const pong = await redis.ping();
    metrics.redis.connected = pong === 'PONG';
    
    if (metrics.redis.connected) {
      // 内存使用情况
      const memoryInfo = await redis.memory('usage', '');
      metrics.redis.memoryUsage = parseInt(memoryInfo) / 1024 / 1024; // MB
      
      // 客户端连接数
      const clientInfo = await redis.info('clients');
      const connectedClients = clientInfo.match(/connected_clients:(\d+)/);
      metrics.redis.connectedClients = connectedClients ? parseInt(connectedClients[1]) : 0;
      
      // 操作统计
      const statsInfo = await redis.info('stats');
      const opsPerSec = statsInfo.match(/instantaneous_ops_per_sec:(\d+)/);
      metrics.redis.operationsPerSecond = opsPerSec ? parseInt(opsPerSec[1]) : 0;
      
      // 延迟测试
      const start = Date.now();
      await redis.ping();
      metrics.redis.latency = Date.now() - start;
    }
    
    await redis.quit();
    
  } catch (error) {
    metrics.redis.connected = false;
    console.error('Redis 监控错误:', error.message);
  }
}

// Vault 监控
async function monitorVault() {
  try {
    const response = await axios.get(`${config.vault.url}/v1/sys/health`, {
      timeout: 5000,
    });
    
    metrics.vault.connected = response.status === 200;
    metrics.vault.initialized = response.data.initialized;
    metrics.vault.sealed = response.data.sealed;
    metrics.vault.version = response.data.version;
    
  } catch (error) {
    metrics.vault.connected = false;
    console.error('Vault 监控错误:', error.message);
  }
}

// 数据库监控
async function monitorDatabase() {
  let client;
  
  try {
    client = new Client(config.database);
    await client.connect();
    metrics.database.connected = true;
    
    // 连接统计
    const connectionInfo = await client.query(`
      SELECT 
        count(*) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    
    metrics.database.activeConnections = parseInt(connectionInfo.rows[0].active_connections);
    metrics.database.maxConnections = parseInt(connectionInfo.rows[0].max_connections);
    
    // 查询性能测试
    const start = Date.now();
    await client.query('SELECT 1');
    metrics.database.queryTime = Date.now() - start;
    
  } catch (error) {
    metrics.database.connected = false;
    console.error('数据库监控错误:', error.message);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// 计算整体状态
function calculateOverallStatus() {
  const allConnected = metrics.redis.connected && metrics.vault.connected && metrics.database.connected;
  
  if (allConnected) {
    metrics.overall.status = 'healthy';
  } else {
    metrics.overall.status = 'degraded';
  }
  
  metrics.overall.timestamp = new Date().toISOString();
}

// 显示监控结果
function displayMetrics() {
  console.clear();
  log('🛡️ 平台保障官 - 实时监控仪表板', 'bold');
  log('=' .repeat(50), 'blue');
  
  // 整体状态
  const statusColor = metrics.overall.status === 'healthy' ? 'green' : 'red';
  log(`\n📊 整体状态: ${metrics.overall.status.toUpperCase()}`, statusColor);
  log(`⏰ 检查时间: ${metrics.overall.timestamp}`);
  
  // Redis 状态
  log('\n🔴 Redis 缓存层:', 'bold');
  log(`   连接状态: ${metrics.redis.connected ? '✅ 正常' : '❌ 异常'}`);
  if (metrics.redis.connected) {
    log(`   内存使用: ${metrics.redis.memoryUsage.toFixed(2)} MB`);
    log(`   客户端连接: ${metrics.redis.connectedClients}`);
    log(`   操作/秒: ${metrics.redis.operationsPerSecond}`);
    log(`   延迟: ${metrics.redis.latency}ms`);
  }
  
  // Vault 状态
  log('\n🔐 Vault 密钥管理:', 'bold');
  log(`   连接状态: ${metrics.vault.connected ? '✅ 正常' : '❌ 异常'}`);
  if (metrics.vault.connected) {
    log(`   初始化: ${metrics.vault.initialized ? '✅ 是' : '❌ 否'}`);
    log(`   封存状态: ${metrics.vault.sealed ? '🔒 已封存' : '🔓 已解封'}`);
    log(`   版本: ${metrics.vault.version}`);
  }
  
  // 数据库状态
  log('\n🗄️ PostgreSQL 数据库:', 'bold');
  log(`   连接状态: ${metrics.database.connected ? '✅ 正常' : '❌ 异常'}`);
  if (metrics.database.connected) {
    log(`   活跃连接: ${metrics.database.activeConnections}/${metrics.database.maxConnections}`);
    log(`   查询时间: ${metrics.database.queryTime}ms`);
  }
  
  // 性能指标
  log('\n📈 性能指标:', 'bold');
  const redisHealth = metrics.redis.connected && metrics.redis.latency < 10 ? '🟢' : '🔴';
  const vaultHealth = metrics.vault.connected && !metrics.vault.sealed ? '🟢' : '🔴';
  const dbHealth = metrics.database.connected && metrics.database.queryTime < 100 ? '🟢' : '🔴';
  
  log(`   Redis: ${redisHealth} ${metrics.redis.latency}ms`);
  log(`   Vault: ${vaultHealth} ${metrics.vault.connected ? '正常' : '异常'}`);
  log(`   数据库: ${dbHealth} ${metrics.database.queryTime}ms`);
  
  // 告警检查
  log('\n🚨 告警检查:', 'bold');
  const alerts = [];
  
  if (metrics.redis.memoryUsage > 100) {
    alerts.push('⚠️ Redis内存使用率过高');
  }
  
  if (metrics.database.activeConnections > metrics.database.maxConnections * 0.8) {
    alerts.push('⚠️ 数据库连接数接近上限');
  }
  
  if (metrics.redis.latency > 100) {
    alerts.push('⚠️ Redis延迟过高');
  }
  
  if (metrics.database.queryTime > 1000) {
    alerts.push('⚠️ 数据库查询时间过长');
  }
  
  if (alerts.length === 0) {
    log('   ✅ 无告警', 'green');
  } else {
    alerts.forEach(alert => log(`   ${alert}`, 'yellow'));
  }
  
  log('\n' + '=' .repeat(50), 'blue');
  log('按 Ctrl+C 退出监控', 'blue');
}

// 主监控循环
async function startMonitoring() {
  log('🚀 启动平台健康监控...', 'bold');
  
  const monitor = async () => {
    await monitorRedis();
    await monitorVault();
    await monitorDatabase();
    calculateOverallStatus();
    displayMetrics();
  };
  
  // 立即执行一次
  await monitor();
  
  // 每5秒监控一次
  setInterval(monitor, 5000);
}

// 优雅退出
process.on('SIGINT', () => {
  log('\n\n👋 监控已停止', 'blue');
  process.exit(0);
});

// 启动监控
if (require.main === module) {
  startMonitoring().catch(error => {
    log(`💥 监控启动失败: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { monitorRedis, monitorVault, monitorDatabase, metrics };
