# 平台保障官支持指南

## 🛡️ 平台保障官任务

**任务**: 保障所有底层基础设施的绝对稳定，为工程师A和B提供专家级支持  
**状态**: 活跃监控中  
**优先级**: 最高  

## 📊 基础设施状态总览

### ✅ 所有服务健康运行

| 服务 | 状态 | 端口 | 健康检查 | 管理界面 |
|------|------|------|----------|----------|
| Redis | 🟢 健康 | 6379 | ✅ 通过 | http://localhost:8081 |
| Vault | 🟢 健康 | 8201 | ✅ 通过 | http://localhost:8080 |
| PostgreSQL | 🟢 健康 | 5432 | ✅ 通过 | - |
| Redis Commander | 🟢 健康 | 8081 | ✅ 通过 | - |
| Vault UI | 🟢 健康 | 8080 | ✅ 通过 | - |

## 🔧 工程师A集成支持

### Redis 缓存层集成

#### 连接配置
```typescript
// Redis 连接配置
const redisConfig = {
  host: 'localhost',
  port: 6379,
  password: 'YOUR_REDIS_PASSWORD',
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000
};

// 使用示例
import Redis from 'ioredis';
const redis = new Redis(redisConfig);
```

#### 缓存策略
```typescript
// 缓存键生成器
export class CacheKeyGenerator {
  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }
  
  static protocol(protocolId: string): string {
    return `protocol:${protocolId}`;
  }
  
  static rateLimit(userId: string, endpoint: string): string {
    return `rate_limit:${userId}:${endpoint}`;
  }
}

// 缓存策略
export class CacheStrategy {
  static readonly USER_PROFILE_TTL = 3600; // 1小时
  static readonly PROTOCOL_TTL = 7200; // 2小时
  static readonly RATE_LIMIT_TTL = 60; // 1分钟
}
```

#### 性能监控
```bash
# 检查Redis性能
docker exec athlete-ally-redis redis-cli --latency-history -i 1

# 检查内存使用
docker exec athlete-ally-redis redis-cli info memory

# 检查连接数
docker exec athlete-ally-redis redis-cli info clients
```

### Vault 密钥管理集成

#### 连接配置
```typescript
// Vault 连接配置
const vaultConfig = {
  url: 'http://localhost:8201',
  token: 'athlete-ally-root-token',
  timeout: 10000,
  retries: 3
};

// 使用示例
import { VaultClient } from './infrastructure/vault/vault-client';
const vault = new VaultClient(vaultConfig);
```

#### 密钥管理
```typescript
// 存储密钥
await vault.writeSecret('athlete-ally/database/main', {
  username: 'athlete',
  password: 'athlete',
  host: 'localhost',
  port: 5432
});

// 读取密钥
const dbCredentials = await vault.readSecret('athlete-ally/database/main');

// 生成随机密钥
const randomKey = await vault.generateRandomKey(32);
```

#### 密钥路径规范
```typescript
// 密钥路径生成器
export class SecretPathGenerator {
  static databaseCredentials(service: string): string {
    return `athlete-ally/database/${service}`;
  }
  
  static apiKeys(service: string): string {
    return `athlete-ally/api-keys/${service}`;
  }
  
  static jwtSecrets(): string {
    return 'athlete-ally/jwt/secrets';
  }
}
```

### PostgreSQL 数据库集成

#### 连接配置
```typescript
// 数据库连接配置
const databaseConfig = {
  host: 'localhost',
  port: 5432,
  user: 'athlete',
  password: 'athlete',
  database: 'athlete_ally_main',
  ssl: false
};

// 连接字符串
const DATABASE_URL = 'postgresql://athlete:athlete@localhost:5432/athlete_ally_main';
```

#### RLS 策略使用
```sql
-- 设置当前用户ID
SELECT set_config('app.current_user_id', 'user-uuid-here', true);

-- 检查用户权限
SELECT * FROM user_permissions;

-- 查看用户协议
SELECT * FROM user_protocols;

-- 查看公开协议
SELECT * FROM public_protocols;
```

#### 权限验证
```typescript
// 权限检查函数
const hasPermission = await client.query(`
  SELECT has_permission($1, $2, $3) as has_permission
`, ['protocol', protocolId, 'read']);

// 批量权限检查
const permissions = await client.query(`
  SELECT * FROM user_permissions 
  WHERE protocol_id = ANY($1)
`, [protocolIds]);
```

## 🔍 实时监控仪表板

### Redis 监控
```bash
# 实时监控Redis
docker exec athlete-ally-redis redis-cli monitor

# 检查慢查询
docker exec athlete-ally-redis redis-cli slowlog get 10

# 内存使用情况
docker exec athlete-ally-redis redis-cli info memory | grep used_memory_human
```

### Vault 监控
```bash
# 检查Vault状态
docker exec athlete-ally-vault vault status

# 检查密钥引擎
docker exec athlete-ally-vault vault secrets list

# 检查策略
docker exec athlete-ally-vault vault policy list
```

### PostgreSQL 监控
```bash
# 检查数据库连接
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT 1;"

# 检查RLS状态
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT * FROM check_rls_status();"

# 检查活跃连接
docker exec postgres psql -U athlete -d athlete_ally_main -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🚨 故障排除指南

### Redis 连接问题
```bash
# 检查Redis是否运行
docker exec athlete-ally-redis redis-cli ping

# 检查密码认证
docker exec athlete-ally-redis redis-cli -a YOUR_REDIS_PASSWORD ping

# 重启Redis服务
docker restart athlete-ally-redis
```

### Vault 访问问题
```bash
# 检查Vault状态
docker exec athlete-ally-vault vault status

# 检查端口映射
docker port athlete-ally-vault

# 重启Vault服务
docker restart athlete-ally-vault
```

### 数据库连接问题
```bash
# 检查PostgreSQL状态
docker exec postgres pg_isready -U athlete -d athlete_ally_main

# 检查用户权限
docker exec postgres psql -U postgres -c "\du"

# 重启PostgreSQL服务
docker restart postgres
```

## 📈 性能基准测试

### Redis 性能测试
```bash
# 运行Redis基准测试
docker exec athlete-ally-redis redis-cli --latency-history -i 1 > redis-latency.log &

# 测试吞吐量
docker exec athlete-ally-redis redis-cli --csv -i 1 -c 100 -n 10000 ping
```

### 数据库性能测试
```sql
-- 测试查询性能
EXPLAIN ANALYZE SELECT * FROM user_permissions;

-- 测试RLS策略性能
EXPLAIN ANALYZE SELECT * FROM protocols WHERE user_id = current_user_id();
```

## 🔧 配置优化建议

### Redis 优化
- 内存使用率保持在80%以下
- 定期清理过期键
- 监控慢查询日志
- 调整淘汰策略

### Vault 优化
- 定期轮换密钥
- 监控访问日志
- 备份密钥数据
- 设置访问策略

### PostgreSQL 优化
- 定期分析表统计信息
- 优化查询计划
- 监控连接数
- 调整缓冲区设置

## 📞 紧急联系

**平台保障官**: 24/7 监控中  
**响应时间**: < 5分钟  
**升级路径**: 立即通知技术负责人  

### 监控指标阈值
- Redis内存使用率: > 80% 告警
- 数据库连接数: > 80% 告警
- 响应时间: > 1000ms 告警
- 错误率: > 1% 告警

---

**最后更新**: 2025-09-12T20:50:00.000Z  
**状态**: 活跃监控中  
**下次检查**: 持续监控
