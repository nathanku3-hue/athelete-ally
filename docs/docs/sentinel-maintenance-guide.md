# ESLint 哨兵文件维护指南

## 概述

哨兵文件是用于验证 ESLint 配置的关键文件，确保不同层级的配置正确应用。维护哨兵列表对于配置漂移检测至关重要。

## 当前哨兵文件

### Frontend 层 (3 个文件)
- `apps/frontend/src/app/layout.tsx` - 应用布局
- `apps/frontend/src/app/page.tsx` - 主页面
- `apps/frontend/src/middleware.ts` - 中间件

### Package 层 (2 个文件)
- `packages/shared-types/src/index.ts` - 共享类型入口
- `packages/shared-types/src/schemas.ts` - 模式定义

### Service 层 (2 个文件)
- `services/planning-engine/src/index.ts` - 规划引擎
- `services/fatigue/src/index.ts` - 疲劳服务

## 维护原则

### 1. 稳定性优先
- 每层至少保持 3 个哨兵文件（当前 Service 层只有 2 个）
- 选择稳定、不经常变更的文件
- 避免选择测试文件或临时文件

### 2. 代表性
- 哨兵文件应该代表该层的典型使用模式
- 包含不同类型的文件（入口文件、工具文件、配置文件）
- 覆盖主要的导入/导出模式

### 3. 可维护性
- 文件路径应该稳定，不经常变更
- 文件内容应该相对稳定
- 避免选择即将重构的文件

## 维护流程

### 添加新哨兵文件
1. 确认文件存在且稳定
2. 更新 `scripts/verify-eslint-config-api.js` 中的 `SENTINEL_FILES`
3. 添加适当的 `expectedRules` 配置
4. 本地测试验证脚本
5. 提交更改

### 移除哨兵文件
1. 确认文件已删除或不再适用
2. 从 `SENTINEL_FILES` 中移除
3. 检查是否影响层覆盖
4. 本地测试验证脚本
5. 提交更改

### 更新哨兵文件路径
1. 确认新路径存在
2. 更新 `SENTINEL_FILES` 中的路径
3. 保持 `expectedRules` 不变
4. 本地测试验证脚本
5. 提交更改

## 故障排除

### 哨兵文件缺失
```bash
# 检查文件是否存在
ls -la apps/frontend/src/app/layout.tsx
ls -la packages/shared-types/src/index.ts
ls -la services/planning-engine/src/index.ts

# 查找替代文件
find . -name "*.ts" -path "*/packages/*" | head -5
find . -name "*.ts" -path "*/services/*" | head -5
find . -name "*.tsx" -path "*/apps/frontend/*" | head -5
```

### 层覆盖不足
```bash
# 检查各层文件数量
find . -name "*.ts" -path "*/packages/*" | wc -l
find . -name "*.ts" -path "*/services/*" | wc -l
find . -name "*.tsx" -path "*/apps/frontend/*" | wc -l
```

### 验证脚本失败
```bash
# 本地运行验证脚本
node scripts/verify-eslint-config-api.js

# 检查特定文件
npx eslint --print-config packages/shared-types/src/index.ts
```

## 最佳实践

### 1. 定期审查
- 每月检查哨兵文件是否仍然存在
- 审查文件是否仍然代表该层的使用模式
- 检查是否有更好的候选文件

### 2. 变更管理
- 任何哨兵文件变更都应该经过代码审查
- 在 PR 中明确说明变更原因
- 确保 CI 通过后再合并

### 3. 文档同步
- 更新此文档以反映哨兵文件变更
- 在提交消息中说明哨兵文件变更
- 通知团队哨兵文件的重要变更

## 监控和警报

### CI 检查
- ESLint Guardrails 作业会检查哨兵文件存在性
- 缺失哨兵文件会导致作业失败
- 错误消息提供清晰的修复指导

### 本地检查
```bash
# 运行哨兵文件检查
node scripts/verify-eslint-config-api.js

# 运行常量模块测试
node scripts/test-eslint-config-constants.js
```

## 未来改进

### 1. 自动化哨兵发现
- 考虑自动发现稳定的哨兵文件
- 基于文件变更频率和稳定性评分
- 自动建议新的哨兵文件

### 2. 动态哨兵管理
- 支持运行时哨兵文件配置
- 基于项目结构自动调整哨兵文件
- 支持环境特定的哨兵文件

### 3. 增强监控
- 添加哨兵文件健康度指标
- 监控哨兵文件变更频率
- 提供哨兵文件使用统计

---

**最后更新**：2024-01-04
**维护者**：@team-lead
**审查者**：@senior-dev
