# 分支保护更新建议

## 当前状态
- 旧的工作流: `boundaries-check.yml` (已弃用)
- 新的工作流: `eslint-guardrails.yml`

## 建议的分支保护更新

### 1. 移除旧的检查
从分支保护中移除以下检查:
- `Boundaries Check (New/Modified Files)`

### 2. 添加新的检查
将以下检查添加到必需状态检查中:
- `ESLint Guardrails & Config Validation`

**重要**: 确保使用确切的作业名称 `ESLint Guardrails & Config Validation`（区分大小写）

### 3. 更新工作流名称
确保分支保护使用正确的工作流名称:
- 旧: `Boundaries Check (New/Modified Files)`
- 新: `ESLint Guardrails & Config Validation`

**验证步骤**:
1. 进入 GitHub Actions 页面
2. 查看 "ESLint Guardrails & Config Validation" 作业
3. 复制确切的作业名称
4. 在分支保护设置中使用完全相同的名称

### 4. 建议的必需检查列表
```
Build Check (Blocking),Test Check (Blocking),Security Scan,ESLint Guardrails & Config Validation
```

### 5. 新增的 ESLint Guardrails 检查特性
- **配置验证**: 验证 ESLint 配置语法和一致性
- **常量测试**: 运行配置常量测试以防止漂移
- **哨兵验证**: 检查哨兵文件健康状态
- **反回归保护**: 扫描内联规则覆盖
- **绕过审计**: 记录和审查绕过使用情况
- **配置工件**: 上传 print-config 工件用于审计

## 手动更新步骤

1. 进入 GitHub 仓库设置
2. 导航到 "Branches" 部分
3. 编辑 `main` 分支的保护规则
4. 在 "Require status checks to pass before merging" 中:
   - 移除: `Boundaries Check (New/Modified Files)`
   - 添加: `ESLint Guardrails & Config Validation`
5. 保存更改

## 验证
更新后，创建 PR 应该会看到新的 ESLint Guardrails 检查运行，
而不是旧的 Boundaries Check。

## 新工作流的特性

### 配置验证
- 验证 ESLint 配置语法
- 显示 Node.js 和 ESLint 版本信息
- 生成配置工件用于审计

### 反回归保护
- 扫描内联 `--rule` 覆盖
- 检测替代配置文件
- 跨平台兼容（Windows/Linux/macOS）

### 配置漂移检测
- 验证哨兵文件的规则严重性
- 检查 Next.js 模式支持
- 生成详细的作业摘要

### 缓存优化
- 基于内容策略的缓存
- 包含 ESLint 版本和配置哈希的缓存键
- 自动失效机制
