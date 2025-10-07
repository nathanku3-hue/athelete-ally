# 包间导入允许列表

## 概述

此文档定义了包间导入的允许模式，用于 `eslint-plugin-boundaries` 或 `import/no-restricted-paths` 规则配置。

## 当前包结构

```
packages/
├── shared-types/          # 共享类型定义
├── protocol-types/        # 协议类型定义
├── health-schema/         # 健康检查模式
├── event-bus/            # 事件总线
├── analytics/            # 分析工具
├── otel-preset/          # OpenTelemetry 预设
├── telemetry-bootstrap/  # 遥测引导
└── shared/               # 共享工具
```

## 允许的包间导入

### shared-types 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/protocol-types';
import { ... } from '@athlete-ally/health-schema';

// 禁止导入
// import { ... } from '@athlete-ally/event-bus';
// import { ... } from '@athlete-ally/analytics';
```

### protocol-types 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';

// 禁止导入
// import { ... } from '@athlete-ally/event-bus';
// import { ... } from '@athlete-ally/analytics';
```

### health-schema 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';

// 禁止导入
// import { ... } from '@athlete-ally/protocol-types';
// import { ... } from '@athlete-ally/event-bus';
```

### event-bus 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';
import { ... } from '@athlete-ally/protocol-types';

// 禁止导入
// import { ... } from '@athlete-ally/analytics';
// import { ... } from '@athlete-ally/otel-preset';
```

### analytics 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';
import { ... } from '@athlete-ally/event-bus';

// 禁止导入
// import { ... } from '@athlete-ally/protocol-types';
// import { ... } from '@athlete-ally/health-schema';
```

### otel-preset 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';

// 禁止导入
// import { ... } from '@athlete-ally/protocol-types';
// import { ... } from '@athlete-ally/event-bus';
```

### telemetry-bootstrap 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';
import { ... } from '@athlete-ally/otel-preset';

// 禁止导入
// import { ... } from '@athlete-ally/protocol-types';
// import { ... } from '@athlete-ally/event-bus';
```

### shared 包
```typescript
// 允许导入
import { ... } from '@athlete-ally/shared-types';

// 禁止导入
// import { ... } from '@athlete-ally/protocol-types';
// import { ... } from '@athlete-ally/event-bus';
```

## ESLint 配置示例

### 使用 eslint-plugin-boundaries
```javascript
// eslint.config.unified.mjs
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: {
      boundaries: boundaries,
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: {
          'packages/shared-types/**': ['packages/protocol-types', 'packages/health-schema'],
          'packages/protocol-types/**': ['packages/shared-types'],
          'packages/health-schema/**': ['packages/shared-types'],
          'packages/event-bus/**': ['packages/shared-types', 'packages/protocol-types'],
          'packages/analytics/**': ['packages/shared-types', 'packages/event-bus'],
          'packages/otel-preset/**': ['packages/shared-types'],
          'packages/telemetry-bootstrap/**': ['packages/shared-types', 'packages/otel-preset'],
          'packages/shared/**': ['packages/shared-types'],
        },
      }],
    },
  },
];
```

### 使用 import/no-restricted-paths
```javascript
// eslint.config.unified.mjs
export default [
  {
    rules: {
      'import/no-restricted-paths': ['error', {
        zones: [
          {
            target: './packages/shared-types/**',
            from: './packages/**',
            except: ['./packages/shared-types/**', './packages/protocol-types/**', './packages/health-schema/**'],
            message: 'shared-types can only import from protocol-types and health-schema',
          },
          {
            target: './packages/protocol-types/**',
            from: './packages/**',
            except: ['./packages/protocol-types/**', './packages/shared-types/**'],
            message: 'protocol-types can only import from shared-types',
          },
          // ... 其他包规则
        ],
      }],
    },
  },
];
```

## 验证脚本更新

### 更新哨兵文件期望
```javascript
// scripts/verify-eslint-config-api.js
const SENTINEL_FILES = {
  'packages/shared-types/src/index.ts': {
    type: 'Package',
    tier: 'package',
    expectedRules: {
      'import/no-internal-modules': 'error', // 从 warn 翻转为 error
      'no-console': 'error'
    }
  },
  // ... 其他哨兵文件
};
```

### 添加边界规则测试
```javascript
// scripts/test-boundaries-rules.js
function testPackageBoundaries() {
  const testCases = [
    {
      file: 'packages/shared-types/src/index.ts',
      allowedImports: ['@athlete-ally/protocol-types', '@athlete-ally/health-schema'],
      forbiddenImports: ['@athlete-ally/event-bus', '@athlete-ally/analytics'],
    },
    // ... 其他测试用例
  ];
  
  testCases.forEach(testCase => {
    // 验证允许的导入
    testCase.allowedImports.forEach(importPath => {
      // 检查导入是否被允许
    });
    
    // 验证禁止的导入
    testCase.forbiddenImports.forEach(importPath => {
      // 检查导入是否被禁止
    });
  });
}
```

## 迁移计划

### 阶段 1：准备允许列表
- [ ] 审查当前包间导入模式
- [ ] 识别合法的包间依赖
- [ ] 创建详细的允许列表
- [ ] 验证允许列表的完整性

### 阶段 2：分阶段实施边界规则
- [ ] 安装和配置 `eslint-plugin-boundaries`
- [ ] **小型包子集测试**:
  - 选择 1-2 个稳定的包（如 `shared-types`）
  - 启用 `warn` 模式进行测试
  - 验证允许列表的准确性
- [ ] **逐步扩展**:
  - 添加更多包到 `warn` 模式
  - 持续验证和调整允许列表
  - 监控导入违规情况
- [ ] **全面测试**:
  - 所有包都在 `warn` 模式下
  - 验证允许列表的完整性
  - 修复所有违规导入

### 阶段 3：启用严格模式
- [ ] **谨慎切换**:
  - 先在小型包子集上启用 `error` 模式
  - 验证没有误报
  - 逐步扩展到所有包
- [ ] 更新验证脚本
- [ ] 运行完整测试套件
- [ ] 验证 CI 通过

### 阶段 4：文档和培训
- [ ] 更新开发文档
- [ ] 创建包边界指南
- [ ] 培训团队新规则
- [ ] 建立审查流程

## 监控和维护

### 定期审查
- 每月审查包间导入模式
- 检查是否有新的合法依赖
- 识别潜在的架构问题
- 更新允许列表

### 变更管理
- 任何包间导入变更都需要审查
- 在 PR 中明确说明变更原因
- 确保边界规则仍然适用
- 更新文档以反映变更

---

**最后更新**：2024-01-04
**状态**：计划中
**优先级**：高
**负责人**：@team-lead
