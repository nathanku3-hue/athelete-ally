# Monorepo Jest 配置总结

## 🎯 完成的工作

### 1. 根Jest配置重构
- ✅ 使用 `projects` 配置支持 monorepo 结构
- ✅ 集成 `pathsToModuleNameMapper` 从 tsconfig 自动生成 moduleNameMapper
- ✅ 为每个包/app配置独立的测试环境

### 2. 项目配置
- ✅ **Frontend**: jsdom 环境，React 组件测试
- ✅ **Gateway BFF**: node 环境，API 测试  
- ✅ **Contracts**: node 环境，严格的覆盖率阈值 (90%)
- ✅ **其他 packages**: node 环境，基础配置

### 3. 路径别名集成
- ✅ 自动从 `tsconfig.json` 的 `paths` 生成 Jest `moduleNameMapper`
- ✅ 支持 `@athlete-ally/*` 包别名
- ✅ 支持 `@contracts-test-utils/*` 测试工具别名

### 4. 脚本更新
- ✅ `test:contracts` - 只运行 contracts 测试
- ✅ `test:contracts:cov` - contracts 覆盖率测试
- ✅ `test:packages` - 运行所有 packages 测试
- ✅ `test:apps` - 运行所有 apps 测试
- ✅ `test:all` - 运行所有测试

## 📁 配置结构

```
jest.config.js (根配置)
├── projects: [
│   ├── frontend (jsdom + React)
│   ├── gateway-bff (node + API)
│   ├── contracts (node + 90% 覆盖率)
│   ├── event-bus (node)
│   ├── shared (node)
│   ├── shared-types (node)
│   ├── protocol-types (node)
│   └── analytics (node)
│   ]
├── pathsToModuleNameMapper 集成
└── 全局覆盖率阈值 (75% 后备)
```

## 🚀 使用方法

### 运行特定项目测试
```bash
# 只运行 contracts 测试
npm run test:contracts

# 运行 contracts 测试 + 覆盖率
npm run test:contracts:cov

# 运行所有 packages 测试
npm run test:packages

# 运行所有 apps 测试
npm run test:apps

# 运行所有测试
npm run test:all
```

### Jest 命令行选项
```bash
# 选择特定项目
jest --selectProjects=contracts,frontend

# 运行特定项目的特定测试
jest --selectProjects=contracts --testNamePattern="API"

# 生成覆盖率报告
jest --selectProjects=contracts --coverage
```

## 🔧 技术特性

### 1. 自动路径映射
- 从 `tsconfig.json` 的 `compilerOptions.paths` 自动生成
- 避免手动维护两套路径配置
- 支持复杂的 monorepo 包引用

### 2. 独立项目配置
- 每个包/app 有独立的测试环境
- 独立的覆盖率阈值
- 独立的 setup 文件

### 3. ESM 支持
- 所有项目都启用 `useESM: true`
- 支持 `.ts/.tsx` 文件的 ESM 导入
- 兼容现代 JavaScript 模块系统

## 📊 验证结果

### Contracts 测试
- ✅ **6个测试套件全部通过** (44个测试)
- ✅ **100% 覆盖率** (helpers.ts)
- ✅ **严格的TypeScript检查通过**
- ✅ **路径别名正常工作**

### 性能
- ✅ 测试运行时间: ~15秒 (44个测试)
- ✅ 并发执行支持
- ✅ 增量测试支持

## 🎯 下一步建议

### 1. CI 集成
```yaml
# GitHub Actions 示例
- name: Run Contracts Tests
  run: npm run test:contracts:cov

- name: Run All Tests
  run: npm run test:all
```

### 2. 覆盖率门禁
- Contracts: 90% (已配置)
- 其他包: 逐步提升到 80%

### 3. 预提交钩子
```bash
# 只运行变更的包测试
jest --selectProjects=contracts --onlyChanged
```

## 🔍 故障排除

### 常见问题
1. **jsdom 环境缺失**: 已安装 `jest-environment-jsdom`
2. **路径映射错误**: 检查 `tsconfig.json` 的 `paths` 配置
3. **ESM 导入问题**: 确保 `useESM: true` 和正确的文件扩展名

### 调试命令
```bash
# 检查 Jest 配置
jest --showConfig

# 运行单个测试文件
jest packages/contracts/__tests__/v3-integration.test.ts

# 详细输出
jest --verbose
```

---

**配置完成时间**: 2025-01-19  
**验证状态**: ✅ 全部通过  
**下一步**: CI 集成和覆盖率门禁


## Result Shape For Tests

- Use a unified discriminated union for test helper responses:
  - `type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: unknown }`
- Helpers return this shape; in tests, branch on `ok` before accessing `data`.
- Utilities exposed per package under `packages/<pkg>/tests/test-utils`:
  - `ok(data)`, `err(error)`, `fromPromise(promise)`, `unwrap(result)`, `map(result, fn)`, `isOk(result)`.
