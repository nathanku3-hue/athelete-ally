# 工程师A快速集成指南

## 🚀 立即开始集成

作为平台保障官，我为您准备了完整的集成支持。所有基础设施已就绪，您可以立即开始集成工作。

## 📋 连接信息速查表

### Redis 缓存层
```bash
# 连接信息
Host: localhost
Port: 6379
Password: YOUR_REDIS_PASSWORD
Database: 0

# 管理界面
URL: http://localhost:8081
用户名: admin
密码: admin
```

### Vault 密钥管理
```bash
# 连接信息
URL: http://localhost:8201
Token: athlete-ally-root-token

# 管理界面
URL: http://localhost:8080
```

### PostgreSQL 数据库
```bash
# 连接信息
Host: localhost
Port: 5432
User: athlete
Password: athlete
Database: athlete_ally_main

# 连接字符串
DATABASE_URL=postgresql://athlete:athlete@localhost:5432/athlete_ally_main
```

## 🔧 快速集成步骤

### 1. 验证连接
```bash
# 验证Redis
docker exec athlete-ally-redis redis-cli -a YOUR_REDIS_PASSWORD ping

# 验证Vault
curl http://localhost:8201/v1/sys/health

# 验证数据库
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT 1;"
```

### 2. 配置环境变量
```bash
# 创建 .env 文件
cat > .env << EOF
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_DB=0

# Vault 配置
VAULT_URL=http://localhost:8201
VAULT_TOKEN=athlete-ally-root-token

# 数据库配置
DATABASE_URL=postgresql://athlete:athlete@localhost:5432/athlete_ally_main
DB_HOST=localhost
DB_PORT=5432
DB_USER=athlete
DB_PASSWORD=athlete
DB_NAME=athlete_ally_main
EOF
```

### 3. 安装依赖
```bash
# 安装Redis客户端
npm install ioredis

# 安装Vault客户端
npm install axios

# 安装PostgreSQL客户端
npm install pg
```

### 4. 基础集成代码
```typescript
// redis-client.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

export default redis;
```

```typescript
// vault-client.ts
import axios from 'axios';

const vault = axios.create({
  baseURL: process.env.VAULT_URL || 'http://localhost:8201',
  headers: {
    'X-Vault-Token': process.env.VAULT_TOKEN || 'athlete-ally-root-token',
  },
});

export default vault;
```

```typescript
// database-client.ts
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://athlete:athlete@localhost:5432/athlete_ally_main',
});

await client.connect();
export default client;
```

## 🧪 测试集成

### Redis 测试
```typescript
// 测试Redis连接
async function testRedis() {
  try {
    await redis.set('test:key', 'test:value');
    const value = await redis.get('test:key');
    console.log('Redis测试通过:', value);
  } catch (error) {
    console.error('Redis测试失败:', error);
  }
}
```

### Vault 测试
```typescript
// 测试Vault连接
async function testVault() {
  try {
    const response = await vault.get('/v1/sys/health');
    console.log('Vault测试通过:', response.data);
  } catch (error) {
    console.error('Vault测试失败:', error);
  }
}
```

### 数据库测试
```typescript
// 测试数据库连接
async function testDatabase() {
  try {
    const result = await client.query('SELECT 1 as test');
    console.log('数据库测试通过:', result.rows[0]);
  } catch (error) {
    console.error('数据库测试失败:', error);
  }
}
```

## 🔍 权限系统集成

### RLS 策略使用
```typescript
// 设置用户上下文
async function setUserContext(userId: string) {
  await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
}

// 检查用户权限
async function checkUserPermissions(userId: string) {
  await setUserContext(userId);
  const result = await client.query('SELECT * FROM user_permissions');
  return result.rows;
}

// 获取用户协议
async function getUserProtocols(userId: string) {
  await setUserContext(userId);
  const result = await client.query('SELECT * FROM user_protocols');
  return result.rows;
}
```

### 协议分享功能
```typescript
// 分享协议
async function shareProtocol(protocolId: string, sharedWith: string, permissions: string[]) {
  const result = await client.query(`
    INSERT INTO protocol_shares (protocol_id, shared_by, shared_with, permissions)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [protocolId, currentUserId, sharedWith, permissions]);
  
  return result.rows[0];
}

// 获取协议分享
async function getProtocolShares(protocolId: string) {
  const result = await client.query(`
    SELECT * FROM protocol_shares 
    WHERE protocol_id = $1 AND is_active = true
  `, [protocolId]);
  
  return result.rows;
}
```

## 📊 性能监控

### 实时监控
```bash
# 启动平台监控
node infrastructure/monitor-platform-health.js
```

### 手动检查
```bash
# 检查Redis性能
docker exec athlete-ally-redis redis-cli --latency-history -i 1

# 检查数据库性能
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT * FROM check_rls_status();"

# 检查Vault状态
docker exec athlete-ally-vault vault status
```

## 🚨 故障排除

### 常见问题
1. **Redis连接失败**
   - 检查密码是否正确
   - 确认端口6379可访问
   - 重启Redis容器

2. **Vault访问失败**
   - 检查端口8201可访问
   - 确认token有效
   - 重启Vault容器

3. **数据库连接失败**
   - 检查用户权限
   - 确认数据库存在
   - 重启PostgreSQL容器

### 紧急联系
- **平台保障官**: 24/7 监控中
- **响应时间**: < 5分钟
- **升级路径**: 立即通知技术负责人

## 📈 性能优化建议

### Redis 优化
- 使用连接池
- 设置合理的TTL
- 监控内存使用率
- 使用管道操作

### 数据库优化
- 使用预编译语句
- 合理使用索引
- 监控查询性能
- 使用连接池

### Vault 优化
- 缓存密钥
- 批量操作
- 监控访问频率
- 定期轮换密钥

## 🎯 集成检查清单

- [ ] Redis连接测试
- [ ] Vault连接测试
- [ ] 数据库连接测试
- [ ] RLS策略验证
- [ ] 权限系统测试
- [ ] 性能基准测试
- [ ] 错误处理测试
- [ ] 监控集成

---

**平台保障官支持**: 24/7 可用  
**最后更新**: 2025-09-12T20:52:00.000Z  
**状态**: 所有服务健康运行
