# 权限系统用户故事与验收标准

## 执行摘要

作为工程师B（前端集成专家），我负责定义和验证新的权限系统的用户面向方面。本文档定义了Protocol和Block权限管理的用户故事、验收标准和测试用例，确保系统安全、逻辑清晰且可测试。

## 🎯 权限系统概述

### 核心权限类型
- **read**: 查看协议/块内容
- **write**: 修改协议/块内容
- **execute**: 执行协议/块
- **share**: 分享协议/块给其他用户

### 权限层级
1. **Protocol级别**: 对整个协议及其所有块的权限
2. **Block级别**: 对特定块的权限
3. **Session级别**: 对特定训练会话的权限

## 📋 用户故事

### Epic 1: 协议所有权管理

#### US-001: 协议创建与所有权
**作为** 一个注册用户  
**我希望** 能够创建新的训练协议  
**以便** 我可以管理自己的训练计划

**验收标准:**
- [ ] 用户可以创建新协议
- [ ] 创建者自动获得所有权限（read, write, execute, share）
- [ ] 协议默认为私有（isPublic = false）
- [ ] 创建者可以设置协议为公开
- [ ] 协议创建后立即在用户协议列表中显示

**测试用例:**
```typescript
// TC-001: 创建协议
Given 用户已登录
When 用户创建新协议 "5/3/1 Strength Program"
Then 协议创建成功
And 用户获得所有权限
And 协议在用户列表中显示

// TC-002: 协议所有权验证
Given 用户A创建了协议
When 用户A查看协议列表
Then 协议显示在列表中
And 用户A可以编辑协议
```

#### US-002: 协议访问控制
**作为** 一个用户  
**我希望** 只能访问我有权限的协议  
**以便** 保护我的隐私和数据安全

**验收标准:**
- [ ] 用户只能查看自己的协议
- [ ] 用户无法访问其他用户的私有协议
- [ ] 用户无法修改没有write权限的协议
- [ ] 用户无法执行没有execute权限的协议
- [ ] 访问被拒绝时返回403 Forbidden错误

**测试用例:**
```typescript
// TC-003: 访问控制验证
Given 用户A创建了私有协议
And 用户B尝试访问该协议
When 用户B请求协议详情
Then 返回403 Forbidden错误
And 用户B无法看到协议内容

// TC-004: 权限检查
Given 用户A有协议的read权限
And 用户A没有write权限
When 用户A尝试修改协议
Then 返回403 Forbidden错误
And 协议内容保持不变
```

### Epic 2: 协议分享与协作

#### US-003: 协议分享
**作为** 协议所有者  
**我希望** 能够将协议分享给其他用户  
**以便** 我们可以协作训练

**验收标准:**
- [ ] 用户可以分享协议给其他用户
- [ ] 分享时可以设置权限级别
- [ ] 被分享用户会收到通知
- [ ] 分享可以设置过期时间
- [ ] 分享可以随时撤销

**测试用例:**
```typescript
// TC-005: 分享协议
Given 用户A有协议的所有权限
When 用户A分享协议给用户B，权限为["read", "execute"]
Then 分享创建成功
And 用户B收到分享通知
And 用户B可以查看协议
And 用户B可以执行协议
But 用户B无法修改协议

// TC-006: 分享权限验证
Given 用户A分享了协议给用户B
When 用户B尝试修改协议
Then 返回403 Forbidden错误
And 显示"您没有修改此协议的权限"
```

#### US-004: 分享管理
**作为** 协议所有者  
**我希望** 能够管理协议的分享设置  
**以便** 我可以控制谁可以访问我的协议

**验收标准:**
- [ ] 用户可以查看所有分享的协议
- [ ] 用户可以修改分享权限
- [ ] 用户可以撤销分享
- [ ] 用户可以查看分享历史
- [ ] 过期的分享自动失效

**测试用例:**
```typescript
// TC-007: 分享管理
Given 用户A分享了协议给用户B和用户C
When 用户A查看分享管理页面
Then 显示所有分享的协议
And 显示每个被分享用户的权限
And 显示分享创建时间

// TC-008: 修改分享权限
Given 用户A分享了协议给用户B，权限为["read"]
When 用户A修改权限为["read", "write"]
Then 权限更新成功
And 用户B可以修改协议
```

### Epic 3: 块级别权限

#### US-005: 块权限继承
**作为** 协议用户  
**我希望** 块的权限继承自协议权限  
**以便** 权限管理简单一致

**验收标准:**
- [ ] 块权限继承自协议权限
- [ ] 用户有协议read权限时，可以查看所有块
- [ ] 用户有协议write权限时，可以修改所有块
- [ ] 用户有协议execute权限时，可以执行所有块
- [ ] 块权限不能超过协议权限

**测试用例:**
```typescript
// TC-009: 块权限继承
Given 用户A有协议的read权限
When 用户A查看协议详情
Then 可以查看所有块的内容
But 无法修改任何块

// TC-010: 块权限限制
Given 用户A有协议的read权限
When 用户A尝试修改块
Then 返回403 Forbidden错误
And 显示"您没有修改此块的权限"
```

#### US-006: 块独立权限
**作为** 协议所有者  
**我希望** 能够为特定块设置独立权限  
**以便** 我可以精细控制访问权限

**验收标准:**
- [ ] 协议所有者可以为块设置独立权限
- [ ] 块权限可以覆盖协议权限
- [ ] 块权限不能超过协议权限
- [ ] 用户可以看到自己的块权限

**测试用例:**
```typescript
// TC-011: 块独立权限
Given 用户A有协议的所有权限
When 用户A为块设置独立权限["read"]
Then 块权限设置成功
And 其他用户只能读取该块
But 无法修改该块

// TC-012: 块权限覆盖
Given 用户A有协议的read权限
And 用户A被授予特定块的write权限
When 用户A尝试修改该块
Then 修改成功
But 无法修改其他块
```

### Epic 4: 公开协议管理

#### US-007: 公开协议访问
**作为** 一个用户  
**我希望** 能够浏览和访问公开协议  
**以便** 我可以发现和学习新的训练方法

**验收标准:**
- [ ] 用户可以浏览公开协议列表
- [ ] 用户可以查看公开协议详情
- [ ] 公开协议默认只有read权限
- [ ] 用户可以复制公开协议到自己的库
- [ ] 公开协议显示创建者信息

**测试用例:**
```typescript
// TC-013: 浏览公开协议
Given 系统中有公开协议
When 用户访问公开协议页面
Then 显示所有公开协议
And 用户可以查看协议详情
But 无法修改协议

// TC-014: 复制公开协议
Given 用户A有公开协议的read权限
When 用户A复制协议到自己的库
Then 复制成功
And 用户A获得新协议的所有权限
And 原协议保持不变
```

#### US-008: 公开协议管理
**作为** 协议所有者  
**我希望** 能够管理协议的公开状态  
**以便** 我可以控制协议的可见性

**验收标准:**
- [ ] 用户可以设置协议为公开或私有
- [ ] 公开协议可以被所有用户查看
- [ ] 私有协议只能被授权用户查看
- [ ] 用户可以随时更改公开状态
- [ ] 公开状态变更会通知相关用户

**测试用例:**
```typescript
// TC-015: 设置协议公开
Given 用户A有私有协议
When 用户A设置协议为公开
Then 协议变为公开
And 所有用户都可以查看协议
And 用户A收到确认通知

// TC-016: 设置协议私有
Given 用户A有公开协议
When 用户A设置协议为私有
Then 协议变为私有
And 只有授权用户可以看到协议
And 其他用户无法访问协议
```

### Epic 5: 权限验证与错误处理

#### US-009: 权限验证
**作为** 系统  
**我希望** 能够验证每个请求的权限  
**以便** 确保数据安全和访问控制

**验收标准:**
- [ ] 每个API请求都验证用户权限
- [ ] 权限验证在中间件层进行
- [ ] 权限验证失败返回适当的错误码
- [ ] 权限验证日志记录
- [ ] 权限验证性能优化

**测试用例:**
```typescript
// TC-017: 权限验证中间件
Given 用户A请求协议详情
When 系统验证权限
Then 检查用户是否有read权限
And 权限验证通过
And 返回协议数据

// TC-018: 权限验证失败
Given 用户A没有协议权限
When 用户A请求协议详情
Then 权限验证失败
And 返回403 Forbidden错误
And 记录权限验证日志
```

#### US-010: 错误处理
**作为** 一个用户  
**我希望** 在权限错误时收到清晰的错误信息  
**以便** 我知道如何解决问题

**验收标准:**
- [ ] 权限错误返回清晰的错误信息
- [ ] 错误信息包含建议的解决方案
- [ ] 错误信息本地化支持
- [ ] 错误信息不泄露敏感信息
- [ ] 错误信息包含请求ID用于调试

**测试用例:**
```typescript
// TC-019: 权限错误信息
Given 用户A没有协议权限
When 用户A请求协议详情
Then 返回403 Forbidden错误
And 错误信息为"您没有访问此协议的权限"
And 错误信息包含请求ID

// TC-020: 权限错误本地化
Given 用户A设置语言为中文
And 用户A没有协议权限
When 用户A请求协议详情
Then 返回中文错误信息
And 错误信息为"您没有访问此协议的权限"
```

## 🧪 测试用例详细规范

### 单元测试用例

#### 权限验证测试
```typescript
describe('Permission Validation', () => {
  test('should allow read access with read permission', () => {
    const user = { id: 'user1', permissions: ['read'] };
    const protocol = { id: 'protocol1', ownerId: 'user1' };
    
    const hasAccess = checkPermission(user, protocol, 'read');
    expect(hasAccess).toBe(true);
  });
  
  test('should deny write access without write permission', () => {
    const user = { id: 'user1', permissions: ['read'] };
    const protocol = { id: 'protocol1', ownerId: 'user1' };
    
    const hasAccess = checkPermission(user, protocol, 'write');
    expect(hasAccess).toBe(false);
  });
});
```

#### 分享功能测试
```typescript
describe('Protocol Sharing', () => {
  test('should create share with correct permissions', async () => {
    const shareData = {
      protocolId: 'protocol1',
      sharedBy: 'user1',
      sharedWith: 'user2',
      permissions: ['read', 'execute']
    };
    
    const share = await createProtocolShare(shareData);
    expect(share.permissions).toEqual(['read', 'execute']);
    expect(share.isActive).toBe(true);
  });
  
  test('should validate share permissions', () => {
    const shareData = {
      protocolId: 'protocol1',
      sharedBy: 'user1',
      sharedWith: 'user2',
      permissions: ['invalid_permission']
    };
    
    expect(() => createProtocolShare(shareData)).toThrow('Invalid permission');
  });
});
```

### 集成测试用例

#### API权限测试
```typescript
describe('API Permission Tests', () => {
  test('should return 403 for unauthorized access', async () => {
    const response = await request(app)
      .get('/api/v1/protocols/protocol1')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('forbidden');
  });
  
  test('should return protocol data for authorized access', async () => {
    const token = generateTestToken('user1');
    const response = await request(app)
      .get('/api/v1/protocols/protocol1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('protocol1');
  });
});
```

#### 数据库权限测试
```typescript
describe('Database Permission Tests', () => {
  test('should enforce RLS policies', async () => {
    // 设置用户A的上下文
    await setUserContext('userA');
    
    // 用户A应该只能看到自己的协议
    const protocols = await prisma.protocol.findMany();
    expect(protocols.every(p => p.createdBy === 'userA')).toBe(true);
  });
  
  test('should prevent cross-user access', async () => {
    // 设置用户A的上下文
    await setUserContext('userA');
    
    // 尝试访问用户B的协议应该失败
    await expect(
      prisma.protocol.findUnique({ where: { id: 'userB-protocol' } })
    ).rejects.toThrow('Access denied');
  });
});
```

### 端到端测试用例

#### 用户流程测试
```typescript
describe('User Flow Tests', () => {
  test('complete protocol sharing flow', async () => {
    // 1. 用户A创建协议
    const protocol = await createProtocol({
      name: 'Test Protocol',
      createdBy: 'userA'
    });
    
    // 2. 用户A分享协议给用户B
    const share = await shareProtocol({
      protocolId: protocol.id,
      sharedBy: 'userA',
      sharedWith: 'userB',
      permissions: ['read', 'execute']
    });
    
    // 3. 用户B接受分享
    await acceptProtocolShare(share.id, 'userB');
    
    // 4. 用户B可以查看协议
    const userBProtocols = await getUserProtocols('userB');
    expect(userBProtocols).toContainEqual(expect.objectContaining({
      id: protocol.id
    }));
    
    // 5. 用户B可以执行协议
    const execution = await startProtocolExecution(protocol.id, 'userB');
    expect(execution.status).toBe('active');
  });
});
```

## 🎨 前端用户体验设计

### 权限管理界面

#### 协议权限设置页面
```typescript
interface ProtocolPermissionsPage {
  // 协议基本信息
  protocol: {
    id: string;
    name: string;
    isPublic: boolean;
    ownerId: string;
  };
  
  // 分享设置
  sharing: {
    isPublic: boolean;
    shares: Array<{
      id: string;
      sharedWith: string;
      permissions: Permission[];
      expiresAt?: Date;
      isActive: boolean;
    }>;
  };
  
  // 权限管理
  permissions: {
    canEdit: boolean;
    canExecute: boolean;
    canShare: boolean;
  };
}
```

#### 分享协议对话框
```typescript
interface ShareProtocolDialog {
  // 分享目标
  targetUser: {
    id: string;
    email: string;
    name: string;
  };
  
  // 权限选择
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
    share: boolean;
  };
  
  // 过期设置
  expiration: {
    enabled: boolean;
    date?: Date;
  };
  
  // 消息
  message: string;
}
```

#### 权限状态指示器
```typescript
interface PermissionIndicator {
  // 权限图标
  icons: {
    read: 'eye' | 'eye-off';
    write: 'edit' | 'edit-off';
    execute: 'play' | 'play-off';
    share: 'share' | 'share-off';
  };
  
  // 权限标签
  labels: {
    read: '查看';
    write: '编辑';
    execute: '执行';
    share: '分享';
  };
  
  // 权限状态
  status: 'granted' | 'denied' | 'pending';
}
```

### 用户交互流程

#### 分享协议流程
1. **选择协议**: 用户在协议列表中选择要分享的协议
2. **点击分享**: 用户点击"分享"按钮
3. **选择用户**: 用户搜索并选择要分享的用户
4. **设置权限**: 用户选择要授予的权限
5. **设置过期**: 用户可选择设置分享过期时间
6. **发送邀请**: 用户发送分享邀请
7. **确认分享**: 被分享用户接受或拒绝邀请

#### 权限管理流程
1. **查看权限**: 用户查看当前协议的权限设置
2. **修改权限**: 用户修改现有分享的权限
3. **撤销分享**: 用户撤销不需要的分享
4. **设置公开**: 用户设置协议为公开或私有
5. **保存更改**: 用户保存权限更改

## 📊 成功标准

### 功能完整性
- [ ] 所有用户故事实现完成
- [ ] 所有验收标准满足
- [ ] 所有测试用例通过
- [ ] 权限验证100%覆盖

### 安全性
- [ ] 无权限绕过漏洞
- [ ] 无数据泄露风险
- [ ] 权限验证性能良好
- [ ] 错误处理安全

### 用户体验
- [ ] 权限界面直观易用
- [ ] 错误信息清晰明确
- [ ] 操作流程简单高效
- [ ] 响应时间满足要求

### 可维护性
- [ ] 代码结构清晰
- [ ] 测试覆盖充分
- [ ] 文档完整准确
- [ ] 易于扩展修改

## 🚀 实施计划

### 第1周: 基础权限系统
- [ ] 实现协议所有权管理
- [ ] 实现基础权限验证
- [ ] 编写单元测试
- [ ] 实现API权限中间件

### 第2周: 分享与协作
- [ ] 实现协议分享功能
- [ ] 实现分享管理界面
- [ ] 编写集成测试
- [ ] 实现权限继承

### 第3周: 公开协议管理
- [ ] 实现公开协议功能
- [ ] 实现协议复制功能
- [ ] 编写端到端测试
- [ ] 实现权限状态指示器

### 第4周: 优化与测试
- [ ] 性能优化
- [ ] 安全测试
- [ ] 用户体验优化
- [ ] 文档完善

---

**文档生成时间**: 2025-09-12T11:00:00.000Z  
**分析师**: 工程师B (前端集成专家)  
**状态**: 完成 ✅  
**目标**: 为Week 1 Sprint提供完整的权限系统用户故事和测试用例
