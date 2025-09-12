# 分支保护设置指南

## 概述

为了确保代码质量和防止破坏性变更，我们为main和develop分支设置了强制性的分支保护规则。

## 受保护的检查

以下检查必须在PR合并前通过：

1. **Build Check (Blocking)** - 所有包必须成功构建
2. **Test Check (Blocking)** - 所有测试必须通过
3. **Code Quality** - 代码质量检查（lint、type-check等）
4. **Security Scan** - 安全扫描检查

## 设置分支保护

### 方法1：使用GitHub Actions工作流

1. 转到Actions页面
2. 选择"Branch Protection Setup"工作流
3. 点击"Run workflow"
4. 输入要保护的分支名称（默认为main）
5. 确认设置并运行

### 方法2：手动设置

1. 转到仓库的Settings > Branches
2. 点击"Add rule"
3. 输入分支名称（main或develop）
4. 启用以下选项：
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require pull request reviews before merging
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require review from code owners
   - ✅ Restrict pushes that create files larger than 100MB
   - ✅ Require linear history
   - ✅ Include administrators

5. 在"Status checks that are required"中添加：
   - Build Check (Blocking)
   - Test Check (Blocking)
   - Code Quality
   - Security Scan

## 验证设置

设置完成后，尝试创建一个包含构建错误的PR来验证保护是否生效：

1. 创建一个新分支
2. 故意引入一个构建错误
3. 创建PR
4. 确认PR无法合并，直到修复错误

## 故障排除

如果遇到问题：

1. 检查GitHub Actions是否正常运行
2. 确认所有必需的检查都在运行
3. 检查分支保护规则是否正确配置
4. 联系管理员获取帮助

## 注意事项

- 只有仓库管理员可以修改分支保护规则
- 紧急修复可能需要临时禁用保护（不推荐）
- 所有变更都应该通过PR流程进行
