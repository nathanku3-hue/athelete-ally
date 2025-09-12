# 🧪 测试配置标准 - 统一测试规范

## 测试文件命名和定位规范

### 文件命名规范
- **所有测试文件必须以 `.test.ts` 结尾**
- **集成测试文件必须以 `.integration.test.ts` 结尾**
- **端到端测试文件必须以 `.e2e.test.ts` 结尾**

### 目录结构规范
```
src/
├── __tests__/           # 单元测试目录
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   └── e2e/            # 端到端测试
├── lib/
│   └── protocols/
│       └── __tests__/   # 协议相关测试
└── components/
    └── __tests__/       # 组件测试

services/
└── [service-name]/
    └── src/
        └── __tests__/   # 服务测试

packages/
└── [package-name]/
    └── __tests__/       # 包测试
```

### 测试文件示例
```typescript
// src/__tests__/unit/user-service.test.ts
import { describe, it, expect } from '@jest/globals';
import { UserService } from '../lib/user-service';

describe('UserService', () => {
  it('should create user successfully', () => {
    // 测试逻辑
  });
});
```

## Jest 配置标准

### 根目录配置 (jest.config.js)
- 支持 TypeScript 和 JavaScript
- 统一的测试文件发现模式
- 正确的路径映射和别名
- 适当的覆盖率收集

### 服务级配置
- 每个服务可以有独立的 jest.config.js
- 继承根配置并覆盖特定设置
- 支持服务特定的测试环境

## 测试类型分类

### 1. 单元测试 (Unit Tests)
- **位置**: `src/__tests__/unit/`
- **命名**: `*.test.ts`
- **目的**: 测试单个函数、类或模块
- **特点**: 快速、独立、无外部依赖

### 2. 集成测试 (Integration Tests)
- **位置**: `src/__tests__/integration/`
- **命名**: `*.integration.test.ts`
- **目的**: 测试模块间的交互
- **特点**: 涉及数据库、API等外部依赖

### 3. 端到端测试 (E2E Tests)
- **位置**: `src/__tests__/e2e/`
- **命名**: `*.e2e.test.ts`
- **目的**: 测试完整的用户流程
- **特点**: 模拟真实用户操作

## 测试脚本标准

### 根目录脚本
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "jest --testPathPattern=__tests__/e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 服务级脚本
```json
{
  "scripts": {
    "test": "jest --config=jest.config.js",
    "test:watch": "jest --watch --config=jest.config.js"
  }
}
```

## 覆盖率标准

### 最低覆盖率要求
- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **函数覆盖率**: ≥ 80%
- **行覆盖率**: ≥ 80%

### 覆盖率排除
- 测试文件本身
- 类型定义文件 (.d.ts)
- 配置文件
- 构建输出文件

## 测试环境配置

### 测试环境变量
```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
REDIS_URL=redis://localhost:6379/1
```

### 测试数据库
- 使用独立的测试数据库
- 每个测试前清理数据
- 使用事务回滚确保隔离

## 最佳实践

### 1. 测试组织
- 按功能模块组织测试
- 使用描述性的测试名称
- 遵循 AAA 模式 (Arrange, Act, Assert)

### 2. 测试数据
- 使用工厂函数创建测试数据
- 避免硬编码的测试数据
- 使用 fixtures 管理复杂数据

### 3. 异步测试
- 正确处理 Promise 和 async/await
- 使用适当的超时设置
- 清理异步资源

### 4. 模拟和存根
- 使用 Jest 的模拟功能
- 模拟外部依赖
- 避免过度模拟

## 执行和监控

### 本地开发
```bash
# 运行所有测试
npm run test

# 运行特定类型测试
npm run test:unit
npm run test:integration
npm run test:e2e

# 监视模式
npm run test:watch
```

### CI/CD 集成
- 所有测试必须在 CI 中通过
- 覆盖率报告必须达到标准
- 失败的测试必须修复

---

**制定者**: 工程师 C (平台与构建专家)  
**制定时间**: $(date)  
**版本**: 1.0
