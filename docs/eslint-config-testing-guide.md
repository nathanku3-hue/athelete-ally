# ESLint 配置验证测试指南

## 概述

本指南说明如何运行 ESLint 配置验证的各种测试，包括正测试和负测试。

## 可用的测试脚本

### 1. 常量模块测试 (scripts/test-eslint-config-constants.js)

**用途**: 验证 ESLint 配置常量的完整性和一致性

**运行方式**:
```bash
# 本地运行
node scripts/test-eslint-config-constants.js

# 在 CI 中运行（自动）
# 此脚本在 ESLint Guardrails CI 作业中自动运行
```

**验证内容**:
- Next.js 模式列表完整性
- 规则严重性配置一致性
- 向后兼容性
- 集成测试

### 2. 配置验证脚本 (scripts/verify-eslint-config-api.js)

**用途**: 验证哨兵文件的 ESLint 配置解析

**运行方式**:
```bash
# 本地运行
node scripts/verify-eslint-config-api.js

# 在 CI 中运行（自动）
# 此脚本在 ESLint Guardrails CI 作业中自动运行
```

**验证内容**:
- 哨兵文件存在性
- 规则严重性匹配
- Next.js 模式支持
- 配置工件生成

### 3. 负测试脚本 (scripts/test-eslint-config-negative.js)

**用途**: 验证配置漂移时验证脚本正确失败

**运行方式**:
```bash
# 仅本地运行
node scripts/test-eslint-config-negative.js
```

**重要警告**:
- ⚠️ **仅在本地运行，绝不在 CI 中运行**
- ⚠️ **此脚本会修改配置文件进行测试**
- ⚠️ **脚本会自动备份和恢复文件**

**验证内容**:
- 配置漂移时常量测试失败
- 配置漂移时验证脚本失败
- 原始配置正常工作

## 测试策略

### 正测试（CI 中运行）
- 验证配置正确性
- 检查哨兵文件健康
- 确保常量一致性
- 生成配置工件

### 负测试（仅本地运行）
- 验证错误检测机制
- 测试配置漂移检测
- 确保验证脚本在错误时失败
- 验证恢复机制

## CI 集成

### ESLint Guardrails 作业
```yaml
- name: Constants Module Testing
  run: |
    echo "🧪 Testing ESLint configuration constants..."
    node scripts/test-eslint-config-constants.js

- name: Config Drift Detection
  run: |
    echo "🔍 Detecting config drift..."
    node scripts/verify-eslint-config-api.js
```

### 路径过滤器
作业在以下文件更改时触发：
- `eslint.config.unified.mjs`
- `scripts/eslint-config-constants.js`
- `scripts/verify-eslint-config-api.js`
- `scripts/test-eslint-config-constants.js`
- `scripts/scan-eslint-overrides.js`
- `.github/workflows/eslint-guardrails.yml`
- `.lintstagedrc.js`
- `package.json`

## 故障排除

### 常量测试失败
```bash
# 检查常量文件
cat scripts/eslint-config-constants.js

# 运行测试查看详细错误
node scripts/test-eslint-config-constants.js
```

### 验证脚本失败
```bash
# 检查哨兵文件
ls -la apps/frontend/src/app/layout.tsx
ls -la packages/shared-types/src/index.ts
ls -la services/planning-engine/src/index.ts

# 运行验证脚本查看详细错误
node scripts/verify-eslint-config-api.js
```

### 负测试失败
```bash
# 检查是否在 CI 环境中
echo $CI
echo $GITHUB_ACTIONS

# 确保在本地环境中运行
node scripts/test-eslint-config-negative.js
```

## 最佳实践

### 开发时
1. 在本地运行所有测试
2. 使用负测试验证错误检测
3. 确保 CI 通过后再提交

### CI 中
1. 只运行正测试
2. 负测试自动跳过
3. 生成配置工件用于审计

### 维护时
1. 定期运行负测试验证机制
2. 更新哨兵文件时运行验证
3. 修改常量时运行测试

## 安全注意事项

### 负测试脚本安全
- 自动检测 CI 环境并跳过
- 自动备份和恢复文件
- 包含明确的警告信息
- 仅在本地环境中运行

### 文件修改
- 负测试脚本会临时修改配置文件
- 所有修改都会被自动恢复
- 不会影响生产环境

---

**最后更新**: 2024-01-04
**维护者**: @team-lead
**审查者**: @senior-dev
