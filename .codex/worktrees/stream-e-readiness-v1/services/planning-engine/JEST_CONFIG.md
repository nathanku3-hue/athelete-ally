# Planning Engine Jest Configuration

## Overview
This service uses a dedicated Jest configuration to handle ESM modules and TypeScript compilation.

## Configuration Hierarchy
```
jest.projects.cjs (orchestrator)
├── jest.config.services.cjs (services layer)
└── services/planning-engine/jest.config.cjs (this service)
```

## Key Features
- **ESM Support**: `useESM: true` with proper module mapping
- **TypeScript**: ts-jest transformer with ESM configuration
- **Module Resolution**: Handles `.js` imports in TypeScript files
- **Package Mapping**: Resolves `@athlete-ally/*` packages correctly

## Usage
```bash
# Run tests for this service only
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Configuration Details
- **rootDir**: `../..` (relative to service directory)
- **testEnvironment**: `node`
- **setupFilesAfterEnv**: Local setup file for test environment
- **moduleNameMapper**: Handles ESM imports and package resolution

## Notes
- This configuration is isolated from the orchestrator
- ESM-specific settings don't interfere with other services
- All test files use `.ts` extensions for imports

## 测试策略

### 三层测试架构
1. **单元测试** (阻塞): 纯函数测试，使用mock，必须通过
2. **集成测试** (非阻塞): 真实数据库/服务，在独立job中运行
3. **E2E测试** (非阻塞): 完整环境测试

### 跳过的测试
以下测试使用 `describe.skip()` 跳过，需要集成测试环境：

- `message-reliability.test.ts` - EventBus集成测试
- `reliability.test.ts` - EventProcessor集成测试  
- `performance/planning-engine-performance.test.ts` - 性能测试
- `integration/end-to-end.test.ts` - 端到端集成测试

**原因**: 需要真实数据库、Redis、NATS等外部服务
**解决方案**: 集成测试job (`.github/workflows/integration-tests.yml`)
**GitHub Issue**: https://github.com/nathanku3-hue/athelete-ally/issues/ci-mock-fix

### 测试环境要求
- **单元测试**: 仅需要mock，无外部依赖
- **集成测试**: 需要PostgreSQL + Redis + NATS
- **性能测试**: 需要完整环境 + 负载测试工具
