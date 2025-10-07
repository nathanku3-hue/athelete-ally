# ESLint 边界规则后续工作计划

## 当前状态

- `import/no-internal-modules` 规则已为包暂时禁用
- 原因：相对导入的模式匹配问题（`./schemas/onboarding` 等）
- 临时解决方案：使用 `"off"` 禁用规则

## 问题分析

### 根本原因
`import/no-internal-modules` 规则的模式匹配在 ESLint flat config 中存在问题：
- 配置的 `allow` 模式：`["./schemas/onboarding", "./**", "../**"]`
- 实际导入：`"./schemas/onboarding"`
- 结果：仍然报告 "not allowed" 错误

### 技术细节
- ESLint 版本：8.57.1
- 配置格式：flat config (eslint.config.unified.mjs)
- 规则：eslint-plugin-import/no-internal-modules

## 后续工作计划

### 阶段 1：调查和诊断（1-2 天）
- [ ] 深入研究 `import/no-internal-modules` 规则的模式匹配机制
- [ ] 测试不同的模式格式（glob vs regex vs exact match）
- [ ] 检查是否有 ESLint 版本兼容性问题
- [ ] 验证 flat config 中的规则优先级

### 阶段 2：替代方案评估（2-3 天）
- [ ] 评估 `eslint-plugin-boundaries` 的适用性
- [ ] 测试 `import/no-restricted-paths` 规则
- [ ] 考虑自定义规则的可能性
- [ ] 评估 TypeScript 路径映射的集成

### 阶段 3：实施和测试（3-5 天）
- [ ] 实施选定的边界规则解决方案
- [ ] 创建包间导入的允许列表
- [ ] 更新验证脚本以反映新规则
- [ ] 全面测试所有包导入场景
- [ ] **分阶段实施策略**:
  - 首先在小型包子集上启用 `warn` 模式
  - 验证允许列表的完整性
  - 逐步扩展到更多包
  - 最后切换到 `error` 模式

### 阶段 4：回滚到严格模式（1-2 天）
- [ ] 将包配置从 `warn` 翻转为 `error`
- [ ] 更新文档和策略
- [ ] 验证 CI 中的严格检查
- [ ] 创建包间导入允许列表文档
- [ ] 更新验证脚本以反映新规则

## 技术考虑

### 包边界策略
```typescript
// 允许的包间导入模式
const ALLOWED_PACKAGE_IMPORTS = {
  'packages/shared-types': [
    'packages/protocol-types',
    'packages/health-schema'
  ],
  'packages/protocol-types': [
    'packages/shared-types'
  ],
  // ... 其他包
};
```

### 验证脚本更新
- 更新哨兵文件验证以检查新的边界规则
- 添加包间导入的特定测试用例
- 确保错误消息提供清晰的修复指导

## 风险缓解

### 当前风险
- 包间边界违规可能被忽略
- 架构分层可能被破坏
- 循环依赖风险增加

### 缓解措施
- 定期审查包导入模式
- 使用 TypeScript 路径映射作为额外保护
- 在 CI 中添加包依赖图验证

## 成功标准

- [ ] 包间导入规则正常工作
- [ ] 验证脚本通过所有测试
- [ ] CI 中的严格检查启用
- [ ] 文档更新完成
- [ ] 团队培训完成

## 时间线

- **第 1 周**：调查和诊断
- **第 2 周**：替代方案评估
- **第 3-4 周**：实施和测试
- **第 5 周**：回滚到严格模式

## 时间限制

### 关键里程碑
- **2024-02-15**: 完成调查和诊断阶段
- **2024-02-22**: 完成替代方案评估
- **2024-03-08**: 完成实施和测试
- **2025-12-01**: 完成回滚到严格模式

### 时间限制策略
- **硬截止日期**: 2025-12-01 (长期目标)
- **里程碑检查**: 每周进度审查
- **风险缓解**: 如果延迟，考虑分阶段实施
- **回退计划**: 如果无法按时完成，保持当前 `warn` 状态
- **跟踪状态**: 作为带日期的任务跟踪

## 负责人

- 技术负责人：@team-lead
- 代码审查：@senior-dev
- 测试验证：@qa-engineer

---

**最后更新**：2024-01-04
**状态**：进行中
**优先级**：高
