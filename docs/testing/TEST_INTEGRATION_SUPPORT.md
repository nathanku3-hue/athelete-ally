# 测试集成支持文档

## 🎯 目标
支持Engineer B的端到端测试集成，确保权限和分享功能的100%绿色测试运行。

## 📋 当前测试状态分析

### 测试框架配置 ✅
- **Jest配置**: 已统一配置，支持TypeScript和ES模块
- **测试环境**: Node.js环境，支持数据库连接
- **覆盖率要求**: 80%+ 代码覆盖率
- **超时设置**: 15秒测试超时

### 现有测试用例 ✅
- **单元测试**: 20+个权限验证测试
- **集成测试**: 6个API权限测试
- **端到端测试**: 6个用户流程测试
- **边界测试**: 错误处理和异常情况测试

---

## 🔧 任务1：RLS策略实施支持

### 1.1 创建RLS策略SQL脚本

```sql
-- services/protocol-engine/sql/rls_policies.sql
-- 启用行级安全
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_sessions ENABLE ROW LEVEL SECURITY;

-- 创建租户隔离策略
CREATE POLICY protocol_tenant_isolation ON protocols
    FOR ALL TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
        AND (
            -- 所有者可以完全访问
            owner_id = current_setting('app.current_user_id')
            OR
            -- 有权限的用户可以访问
            EXISTS (
                SELECT 1 FROM protocol_permissions pp
                WHERE pp.protocol_id = protocols.id
                AND pp.user_id = current_setting('app.current_user_id')
                AND pp.is_active = true
                AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
            )
            OR
            -- 公开协议所有租户用户都可以查看
            (visibility = 'PUBLIC' AND is_public = true)
        )
    );

-- 创建用户隔离策略
CREATE POLICY user_tenant_isolation ON users
    FOR ALL TO authenticated
    USING (
        tenant_id = current_setting('app.current_tenant_id')
    );

-- 创建权限管理策略
CREATE POLICY protocol_permission_control ON protocol_permissions
    FOR ALL TO authenticated
    USING (
        -- 只能管理自己租户的权限
        protocol_id IN (
            SELECT id FROM protocols 
            WHERE tenant_id = current_setting('app.current_tenant_id')
        )
        AND (
            -- 协议所有者可以管理权限
            protocol_id IN (
                SELECT id FROM protocols 
                WHERE owner_id = current_setting('app.current_user_id')
            )
            OR
            -- 有管理权限的用户可以管理权限
            EXISTS (
                SELECT 1 FROM protocol_permissions pp
                WHERE pp.protocol_id = protocol_permissions.protocol_id
                AND pp.user_id = current_setting('app.current_user_id')
                AND 'SHARE' = ANY(pp.permissions)
                AND pp.is_active = true
            )
        )
    );

-- 创建分享管理策略
CREATE POLICY protocol_share_control ON protocol_shares
    FOR ALL TO authenticated
    USING (
        -- 只能管理自己租户的分享
        protocol_id IN (
            SELECT id FROM protocols 
            WHERE tenant_id = current_setting('app.current_tenant_id')
        )
        AND (
            -- 协议所有者可以管理分享
            protocol_id IN (
                SELECT id FROM protocols 
                WHERE owner_id = current_setting('app.current_user_id')
            )
            OR
            -- 分享者可以管理自己的分享
            shared_by = current_setting('app.current_user_id')
            OR
            -- 被分享者可以查看自己的分享
            shared_with = current_setting('app.current_tenant_id')
        )
    );
```

### 1.2 创建权限检查函数

```sql
-- services/protocol-engine/sql/permission_functions.sql
-- 检查用户是否有特定权限
CREATE OR REPLACE FUNCTION has_protocol_permission(
    p_protocol_id TEXT,
    p_user_id TEXT,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM protocol_permissions pp
        WHERE pp.protocol_id = p_protocol_id
        AND pp.user_id = p_user_id
        AND p_permission = ANY(pp.permissions)
        AND pp.is_active = true
        AND (pp.expires_at IS NULL OR pp.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否是协议所有者
CREATE OR REPLACE FUNCTION is_protocol_owner(
    p_protocol_id TEXT,
    p_user_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM protocols
        WHERE id = p_protocol_id
        AND owner_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否可以访问协议
CREATE OR REPLACE FUNCTION can_access_protocol(
    p_protocol_id TEXT,
    p_user_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM protocols p
        WHERE p.id = p_protocol_id
        AND p.tenant_id = current_setting('app.current_tenant_id')
        AND (
            p.owner_id = p_user_id
            OR has_protocol_permission(p_protocol_id, p_user_id, 'READ')
            OR (p.visibility = 'PUBLIC' AND p.is_public = true)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.3 创建测试数据库设置脚本

```sql
-- tests/sql/test_database_setup.sql
-- 创建测试数据库和用户
CREATE DATABASE athlete_ally_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE athlete_ally_test TO test_user;

-- 连接到测试数据库
\c athlete_ally_test;

-- 创建测试表结构
-- (这里会包含完整的schema创建语句)

-- 设置测试环境变量
ALTER DATABASE athlete_ally_test SET app.current_tenant_id = 'test_tenant_1';
ALTER DATABASE athlete_ally_test SET app.current_user_id = 'test_user_1';
```

---

## 🧪 任务2：测试环境配置

### 2.1 测试数据库配置

```typescript
// tests/helpers/database-setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

export class TestDatabaseSetup {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/athlete_ally_test'
        }
      }
    });
  }
  
  async setup(): Promise<void> {
    // 1. 重置数据库
    await this.resetDatabase();
    
    // 2. 运行迁移
    await this.runMigrations();
    
    // 3. 应用RLS策略
    await this.applyRLSPolicies();
    
    // 4. 创建测试数据
    await this.createTestData();
  }
  
  async teardown(): Promise<void> {
    await this.prisma.$disconnect();
  }
  
  private async resetDatabase(): Promise<void> {
    // 删除所有表
    await this.prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await this.prisma.$executeRaw`CREATE SCHEMA public`;
  }
  
  private async runMigrations(): Promise<void> {
    // 运行Prisma迁移
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  }
  
  private async applyRLSPolicies(): Promise<void> {
    // 应用RLS策略
    const rlsScript = await import('../sql/rls_policies.sql');
    await this.prisma.$executeRaw`${rlsScript}`;
  }
  
  private async createTestData(): Promise<void> {
    // 创建测试租户
    await this.prisma.tenant.create({
      data: {
        id: 'test_tenant_1',
        name: 'Test Tenant',
        domain: 'test.athlete-ally.com',
        isActive: true
      }
    });
    
    // 创建测试用户
    await this.prisma.user.createMany({
      data: [
        {
          id: 'test_user_1',
          email: 'user1@test.com',
          name: 'Test User 1',
          tenantId: 'test_tenant_1',
          isActive: true
        },
        {
          id: 'test_user_2',
          email: 'user2@test.com',
          name: 'Test User 2',
          tenantId: 'test_tenant_1',
          isActive: true
        }
      ]
    });
  }
}
```

### 2.2 测试辅助函数

```typescript
// tests/helpers/test-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createTestUser(email: string, name: string) {
  return await prisma.user.create({
    data: {
      email,
      name,
      tenantId: 'test_tenant_1',
      isActive: true
    }
  });
}

export async function createTestProtocol(name: string, ownerId: string) {
  return await prisma.protocol.create({
    data: {
      name,
      ownerId,
      tenantId: 'test_tenant_1',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 12,
      frequency: 3,
      visibility: 'PRIVATE',
      isActive: true,
      isPublic: false
    }
  });
}

export async function createTestShare(protocolId: string, sharedBy: string, sharedWith: string, permissions: string[]) {
  return await prisma.protocolShare.create({
    data: {
      protocolId,
      sharedBy,
      sharedWith,
      permissions: permissions as any[],
      isActive: true
    }
  });
}

export async function cleanupTestData() {
  // 清理测试数据
  await prisma.protocolShare.deleteMany({
    where: {
      protocol: {
        tenantId: 'test_tenant_1'
      }
    }
  });
  
  await prisma.protocolPermission.deleteMany({
    where: {
      protocol: {
        tenantId: 'test_tenant_1'
      }
    }
  });
  
  await prisma.protocol.deleteMany({
    where: {
      tenantId: 'test_tenant_1'
    }
  });
  
  await prisma.user.deleteMany({
    where: {
      tenantId: 'test_tenant_1'
    }
  });
  
  await prisma.tenant.deleteMany({
    where: {
      id: 'test_tenant_1'
    }
  });
}
```

### 2.3 测试环境变量配置

```typescript
// tests/helpers/test-env.ts
export function setupTestEnvironment() {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.TEST_DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/athlete_ally_test';
  process.env.APP_CURRENT_TENANT_ID = 'test_tenant_1';
  process.env.APP_CURRENT_USER_ID = 'test_user_1';
  
  // 设置JWT密钥
  process.env.JWT_SECRET = 'test_jwt_secret';
  
  // 设置Redis URL
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  
  // 设置NATS URL
  process.env.NATS_URL = 'nats://localhost:4222';
}
```

---

## 🔧 任务3：Redis缓存层实现

### 3.1 缓存服务接口

```typescript
// services/cache/src/CacheService.ts
export interface CacheService {
  // 基础操作
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // 批量操作
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(keyValuePairs: Record<string, T>, ttl?: number): Promise<void>;
  
  // 模式匹配
  keys(pattern: string): Promise<string[]>;
  
  // 过期管理
  expire(key: string, ttl: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

export class RedisCacheService implements CacheService {
  private redis: Redis;
  
  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
  
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.redis.mget(keys);
    return values.map(value => value ? JSON.parse(value) : null);
  }
  
  async mset<T>(keyValuePairs: Record<string, T>, ttl?: number): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const [key, value] of Object.entries(keyValuePairs)) {
      const serialized = JSON.stringify(value);
      if (ttl) {
        pipeline.setex(key, ttl, serialized);
      } else {
        pipeline.set(key, serialized);
      }
    }
    
    await pipeline.exec();
  }
  
  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }
  
  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }
  
  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }
}
```

### 3.2 协议缓存策略

```typescript
// services/cache/src/ProtocolCacheService.ts
export class ProtocolCacheService {
  private cache: CacheService;
  private readonly TTL = {
    PROTOCOL_SUMMARY: 3600, // 1小时
    PROTOCOL_DETAILS: 1800, // 30分钟
    PROTOCOL_PERMISSIONS: 900, // 15分钟
    PROTOCOL_SHARES: 900, // 15分钟
    USER_PROTOCOLS: 1800, // 30分钟
    PUBLIC_PROTOCOLS: 3600 // 1小时
  };
  
  constructor(cache: CacheService) {
    this.cache = cache;
  }
  
  // 协议摘要缓存
  async getProtocolSummary(protocolId: string): Promise<ProtocolSummary | null> {
    const key = `protocol:summary:${protocolId}`;
    return await this.cache.get<ProtocolSummary>(key);
  }
  
  async setProtocolSummary(protocolId: string, summary: ProtocolSummary): Promise<void> {
    const key = `protocol:summary:${protocolId}`;
    await this.cache.set(key, summary, this.TTL.PROTOCOL_SUMMARY);
  }
  
  // 协议详情缓存
  async getProtocolDetails(protocolId: string): Promise<Protocol | null> {
    const key = `protocol:details:${protocolId}`;
    return await this.cache.get<Protocol>(key);
  }
  
  async setProtocolDetails(protocolId: string, protocol: Protocol): Promise<void> {
    const key = `protocol:details:${protocolId}`;
    await this.cache.set(key, protocol, this.TTL.PROTOCOL_DETAILS);
  }
  
  // 用户协议列表缓存
  async getUserProtocols(userId: string, tenantId: string): Promise<ProtocolSummary[] | null> {
    const key = `user:protocols:${tenantId}:${userId}`;
    return await this.cache.get<ProtocolSummary[]>(key);
  }
  
  async setUserProtocols(userId: string, tenantId: string, protocols: ProtocolSummary[]): Promise<void> {
    const key = `user:protocols:${tenantId}:${userId}`;
    await this.cache.set(key, protocols, this.TTL.USER_PROTOCOLS);
  }
  
  // 公开协议列表缓存
  async getPublicProtocols(): Promise<ProtocolSummary[] | null> {
    const key = 'protocols:public';
    return await this.cache.get<ProtocolSummary[]>(key);
  }
  
  async setPublicProtocols(protocols: ProtocolSummary[]): Promise<void> {
    const key = 'protocols:public';
    await this.cache.set(key, protocols, this.TTL.PUBLIC_PROTOCOLS);
  }
  
  // 权限缓存
  async getProtocolPermissions(protocolId: string, userId: string): Promise<string[] | null> {
    const key = `protocol:permissions:${protocolId}:${userId}`;
    return await this.cache.get<string[]>(key);
  }
  
  async setProtocolPermissions(protocolId: string, userId: string, permissions: string[]): Promise<void> {
    const key = `protocol:permissions:${protocolId}:${userId}`;
    await this.cache.set(key, permissions, this.TTL.PROTOCOL_PERMISSIONS);
  }
  
  // 缓存失效
  async invalidateProtocol(protocolId: string): Promise<void> {
    const patterns = [
      `protocol:summary:${protocolId}`,
      `protocol:details:${protocolId}`,
      `protocol:permissions:${protocolId}:*`,
      `protocol:shares:${protocolId}:*`
    ];
    
    for (const pattern of patterns) {
      const keys = await this.cache.keys(pattern);
      if (keys.length > 0) {
        await this.cache.delete(keys[0]); // 删除第一个匹配的键
      }
    }
  }
  
  async invalidateUserProtocols(userId: string, tenantId: string): Promise<void> {
    const key = `user:protocols:${tenantId}:${userId}`;
    await this.cache.delete(key);
  }
  
  async invalidatePublicProtocols(): Promise<void> {
    const key = 'protocols:public';
    await this.cache.delete(key);
  }
}
```

---

## 🚀 任务4：数据库查询优化

### 4.1 查询性能分析

```sql
-- 分析权限检查查询性能
EXPLAIN (ANALYZE, BUFFERS) 
SELECT p.*, pp.permissions
FROM protocols p
LEFT JOIN protocol_permissions pp ON p.id = pp.protocol_id
WHERE p.tenant_id = 'test_tenant_1'
AND (
    p.owner_id = 'test_user_1'
    OR pp.user_id = 'test_user_1'
    OR (p.visibility = 'PUBLIC' AND p.is_public = true)
)
AND pp.is_active = true
AND (pp.expires_at IS NULL OR pp.expires_at > NOW());
```

### 4.2 优化索引策略

```sql
-- 为权限检查优化索引
CREATE INDEX CONCURRENTLY idx_protocols_tenant_owner_permissions 
ON protocols(tenant_id, owner_id, visibility, is_public) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_protocol_permissions_user_active 
ON protocol_permissions(user_id, is_active, expires_at) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_protocol_permissions_protocol_user 
ON protocol_permissions(protocol_id, user_id, is_active);

-- 复合索引优化
CREATE INDEX CONCURRENTLY idx_protocols_tenant_visibility_public 
ON protocols(tenant_id, visibility, is_public, is_active) 
WHERE visibility = 'PUBLIC' AND is_public = true;
```

### 4.3 查询优化建议

```typescript
// 优化后的权限检查查询
export class OptimizedPermissionService {
  async checkProtocolAccess(protocolId: string, userId: string, tenantId: string): Promise<boolean> {
    // 使用物化视图优化权限检查
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS(
        SELECT 1 FROM user_protocol_permissions 
        WHERE user_id = ${userId} 
        AND protocol_id = ${protocolId}
        AND tenant_id = ${tenantId}
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
      ) as has_access
    `;
    
    return result[0].has_access;
  }
  
  async getUserProtocols(userId: string, tenantId: string): Promise<ProtocolSummary[]> {
    // 使用缓存和优化的查询
    const cacheKey = `user:protocols:${tenantId}:${userId}`;
    const cached = await this.cache.get<ProtocolSummary[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // 优化的数据库查询
    const protocols = await this.prisma.protocol.findMany({
      where: {
        tenantId,
        OR: [
          { ownerId: userId },
          { 
            permissions: {
              some: {
                userId,
                isActive: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } }
                ]
              }
            }
          },
          { 
            visibility: 'PUBLIC',
            isPublic: true
          }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        frequency: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // 缓存结果
    await this.cache.set(cacheKey, protocols, 1800);
    
    return protocols;
  }
}
```

---

## 📋 实施检查清单

### 测试集成支持
- [ ] RLS策略SQL脚本已创建
- [ ] 权限检查函数已实现
- [ ] 测试数据库设置脚本已创建
- [ ] 测试辅助函数已实现
- [ ] 测试环境变量已配置

### 缓存层实现
- [ ] Redis缓存服务已实现
- [ ] 协议缓存策略已定义
- [ ] 缓存失效机制已实现
- [ ] 缓存性能监控已配置

### 查询优化
- [ ] 查询性能分析已完成
- [ ] 优化索引已创建
- [ ] 查询优化建议已实施
- [ ] 性能监控已配置

---

## 🎯 与Engineer B的协作要点

### 1. 测试数据准备
- 提供完整的测试数据创建脚本
- 确保测试环境隔离
- 支持并发测试执行

### 2. 权限验证支持
- 提供权限检查API
- 支持细粒度权限测试
- 确保RLS策略正确应用

### 3. 性能优化支持
- 提供缓存层支持
- 优化数据库查询
- 确保测试执行性能

### 4. 错误处理支持
- 提供清晰的错误信息
- 支持权限错误测试
- 确保错误处理一致性

---

## 🏆 成功标准

### 测试覆盖率
- **单元测试**: 90%+ 覆盖率
- **集成测试**: 80%+ 覆盖率
- **端到端测试**: 100% 通过率

### 性能指标
- **权限检查**: <50ms 响应时间
- **协议查询**: <100ms 响应时间
- **缓存命中率**: >80%

### 功能完整性
- **权限控制**: 100% 功能覆盖
- **分享功能**: 100% 功能覆盖
- **错误处理**: 100% 场景覆盖

通过实施这些支持措施，我们可以确保Engineer B的测试套件能够100%绿色运行，同时为系统提供高性能的缓存和优化的数据库查询。
