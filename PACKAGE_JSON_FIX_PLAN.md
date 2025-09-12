# 📦 Package.json 构建脚本修复计划

## 问题分析

### 当前问题
1. **测试框架不统一** - 有些服务使用 Jest，有些使用 Vitest
2. **构建脚本不一致** - 不同服务有不同的构建和测试命令
3. **依赖管理混乱** - 共享包依赖引用不一致
4. **脚本命名不统一** - 相同功能的脚本使用不同名称

### 修复策略
1. 统一所有服务使用 Jest 作为测试框架
2. 标准化构建脚本命名和功能
3. 确保共享包依赖正确引用
4. 建立一致的开发工作流

## 修复方案

### 1. 标准服务 package.json 模板
```json
{
  "name": "[service-name]",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest --passWithNoTests",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "jest --testPathPattern=__tests__/e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "@athlete-ally/contracts": "workspace:*",
    "@athlete-ally/event-bus": "workspace:*",
    "@athlete-ally/shared": "workspace:*",
    "@athlete-ally/shared-types": "workspace:*",
    "@opentelemetry/api": "^1.7.0",
    "@opentelemetry/auto-instrumentations-node": "^0.40.3",
    "@opentelemetry/exporter-jaeger": "^1.18.1",
    "@opentelemetry/exporter-prometheus": "^0.45.1",
    "@opentelemetry/sdk-node": "^0.45.1",
    "@prisma/client": "^5.7.1",
    "dotenv": "^16.4.5",
    "fastify": "^4.28.1",
    "ioredis": "^5.4.1",
    "nats": "^2.19.0",
    "pg": "^8.11.5",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/jest": "^29.5.8",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "prisma": "^5.7.1",
    "supertest": "^7.1.3",
    "ts-jest": "^29.1.1",
    "tslib": "^2.6.2",
    "tsx": "^4.16.2",
    "typescript": "^5.4.5"
  }
}
```

### 2. 根目录 package.json 更新
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "jest --testPathPattern=__tests__/e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "turbo": "turbo",
    "build:all": "turbo run build",
    "test:all": "turbo run test",
    "type-check:all": "turbo run type-check",
    "lint:all": "turbo run lint"
  }
}
```

## 修复步骤

### 步骤 1: 统一测试框架
- 将所有服务的测试框架统一为 Jest
- 移除 Vitest 相关依赖和配置
- 更新测试脚本命令

### 步骤 2: 标准化构建脚本
- 统一所有服务的脚本命名
- 确保构建、测试、类型检查脚本一致
- 添加 lint 和 lint:fix 脚本

### 步骤 3: 修复共享包依赖
- 使用 workspace:* 引用共享包
- 确保所有服务正确引用共享包
- 验证依赖解析正确

### 步骤 4: 更新根目录脚本
- 添加统一的测试和构建脚本
- 支持按类型运行测试
- 添加覆盖率收集

## 预期结果

### 修复后效果
- ✅ 所有服务使用统一的测试框架 (Jest)
- ✅ 构建脚本命名和功能一致
- ✅ 共享包依赖正确引用
- ✅ 开发工作流统一
- ✅ 所有测试可以正常运行

### 验证方法
```bash
# 检查所有服务类型
npm run type-check:all

# 构建所有服务
npm run build:all

# 运行所有测试
npm run test:all

# 检查覆盖率
npm run test:coverage
```

---

**制定者**: 工程师 C (平台与构建专家)  
**制定时间**: $(date)  
**版本**: 1.0
