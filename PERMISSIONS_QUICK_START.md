# 权限系统快速启动指南

## 🚀 快速开始

本指南将帮助开发团队快速理解和实施权限系统。

## 📋 核心概念

### 权限类型
- **read**: 查看协议/块内容
- **write**: 修改协议/块内容  
- **execute**: 执行协议/块
- **share**: 分享协议/块给其他用户

### 权限层级
1. **Protocol级别**: 对整个协议及其所有块的权限
2. **Block级别**: 对特定块的权限
3. **Session级别**: 对特定训练会话的权限

## 🎯 用户故事概览

### Epic 1: 协议所有权管理
- **US-001**: 用户创建协议并获得所有权
- **US-002**: 用户只能访问自己的协议

### Epic 2: 协议分享与协作
- **US-003**: 协议所有者可以分享协议
- **US-004**: 协议所有者可以管理分享

### Epic 3: 块级别权限
- **US-005**: 块权限继承自协议权限
- **US-006**: 块支持独立权限设置

### Epic 4: 公开协议管理
- **US-007**: 用户可以浏览公开协议
- **US-008**: 协议所有者可以管理公开状态

### Epic 5: 权限验证与错误处理
- **US-009**: 系统验证每个请求的权限
- **US-010**: 权限错误时返回清晰信息

## 🧪 测试用例概览

### 单元测试 (8个)
```typescript
// 权限验证测试
test('should allow read access with read permission')
test('should deny write access without write permission')

// 分享功能测试
test('should create share with correct permissions')
test('should validate share permissions')
```

### 集成测试 (6个)
```typescript
// API权限测试
test('should return 403 for unauthorized access')
test('should return protocol data for authorized access')

// 数据库权限测试
test('should enforce RLS policies')
test('should prevent cross-user access')
```

### 端到端测试 (6个)
```typescript
// 用户流程测试
test('complete protocol sharing flow')
test('permission management workflow')
```

## 🎨 前端组件使用

### ProtocolPermissionsManager
```typescript
import ProtocolPermissionsManager from '@/components/permissions/ProtocolPermissionsManager';

<ProtocolPermissionsManager
  protocol={protocol}
  onPermissionChange={handlePermissionChange}
  onShareChange={handleShareChange}
/>
```

### PermissionIndicator
```typescript
import { PermissionIndicator } from '@/components/permissions/ProtocolPermissionsManager';

<PermissionIndicator
  permissions={['read', 'write']}
  size="md"
  showLabels={true}
/>
```

## 🔧 API使用示例

### 权限检查
```typescript
import { permissionsAPI } from '@/lib/api/permissions-api';

// 检查权限
const hasPermission = await permissionsAPI.checkPermission(
  'protocol123',
  'protocol',
  'read',
  token
);
```

### 分享协议
```typescript
// 分享协议
const share = await permissionsAPI.shareProtocol({
  protocolId: 'protocol123',
  sharedWith: 'user456',
  permissions: ['read', 'execute'],
  message: '请查看这个训练协议'
}, token);
```

### 权限管理
```typescript
// 获取协议分享
const shares = await permissionsAPI.getProtocolShares('protocol123', token);

// 更新分享权限
await permissionsAPI.updateProtocolShare('share123', {
  permissions: ['read', 'write']
}, token);

// 撤销分享
await permissionsAPI.revokeProtocolShare('share123', token);
```

## 🛡️ 权限验证中间件

### 使用中间件
```typescript
import { permissionsMiddleware } from '@/lib/middleware/permissions-middleware';

// 创建权限验证中间件
const checkProtocolRead = permissionsMiddleware.createPermissionMiddleware(
  'protocol',
  'read',
  (request) => request.params.id
);

// 应用中间件
app.get('/api/v1/protocols/:id', checkProtocolRead, getProtocol);
```

### 装饰器使用
```typescript
import { RequirePermission } from '@/lib/middleware/permissions-middleware';

class ProtocolController {
  @RequirePermission('protocol', 'read', (req) => req.params.id)
  async getProtocol(request: FastifyRequest, reply: FastifyReply) {
    // 自动权限验证
  }
}
```

## 📊 数据库设计

### ProtocolShares表
```sql
CREATE TABLE protocol_shares (
  id VARCHAR PRIMARY KEY,
  protocol_id VARCHAR NOT NULL,
  shared_by VARCHAR NOT NULL,
  shared_with VARCHAR NOT NULL,
  permissions TEXT[] NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS策略
```sql
-- 用户只能看到自己的分享
CREATE POLICY protocol_shares_policy ON protocol_shares
  FOR ALL TO authenticated
  USING (shared_by = current_user_id() OR shared_with = current_user_id());
```

## 🚀 开发流程

### 1. 后端开发
1. 实现权限验证中间件
2. 配置数据库RLS策略
3. 开发权限管理API
4. 实现分享功能

### 2. 前端开发
1. 集成权限管理组件
2. 实现用户交互流程
3. 添加权限状态指示
4. 优化用户体验

### 3. 测试验证
1. 运行单元测试
2. 执行集成测试
3. 进行端到端测试
4. 性能和安全测试

## 📈 性能优化

### 权限缓存
```typescript
// 权限缓存配置
const cacheConfig = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 1000, // 最大1000个权限记录
  strategy: 'lru' // LRU淘汰策略
};
```

### 批量权限检查
```typescript
// 批量检查权限
const results = await permissionsAPI.batchCheckPermissions([
  { resourceId: 'protocol1', resourceType: 'protocol', permission: 'read' },
  { resourceId: 'protocol2', resourceType: 'protocol', permission: 'write' }
], token);
```

## 🔍 调试指南

### 权限调试
```typescript
// 启用权限调试日志
process.env.PERMISSION_DEBUG = 'true';

// 查看权限检查日志
console.log('Permission check:', {
  userId,
  resourceId,
  permission,
  result
});
```

### 常见问题
1. **权限检查失败**: 检查JWT token和用户身份
2. **分享创建失败**: 验证用户权限和分享数据
3. **权限缓存问题**: 清除缓存或检查缓存配置

## 📚 相关文档

- [用户故事详细说明](PERMISSIONS_USER_STORIES.md)
- [测试用例完整列表](tests/permissions/protocol-permissions.test.ts)
- [前端组件API文档](src/components/permissions/ProtocolPermissionsManager.tsx)
- [API接口文档](src/lib/api/permissions-api.ts)
- [中间件使用指南](src/lib/middleware/permissions-middleware.ts)

## 🎯 下一步行动

1. **立即开始**: 后端权限验证实现
2. **并行开发**: 前端组件集成
3. **持续测试**: 运行测试用例验证
4. **性能优化**: 权限缓存和批量操作

---

**创建时间**: 2025-09-12T12:15:00.000Z  
**负责人**: 工程师B (前端集成专家)  
**状态**: 完成 ✅  
**用途**: 开发团队快速启动指南

