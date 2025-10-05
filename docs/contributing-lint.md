# ESLint 贡献指南

## 统一配置策略

我们使用 `eslint.config.unified.mjs` 作为单一真实来源，确保本地开发和 CI 环境的一致性。

### 配置原则

1. **单一真实来源**: 所有 ESLint 调用必须使用 `--config eslint.config.unified.mjs`
2. **禁止内联覆盖**: 不允许使用 `--rule` 参数覆盖配置
3. **环境一致性**: 本地开发、CI 和 lint-staged 使用相同配置

### 边界规则策略

#### 前端应用 (`apps/frontend/`)
- `import/no-internal-modules`: **warn** (允许 Next.js 模式)
- 允许的导入模式:
  - `./**` - 相对导入
  - `../**` - 父目录导入
  - `@/**` - Next.js 别名
  - `@athlete-ally/**` - 内部包
- 允许的 Next.js 内置模块:
  - `next/*` - 所有 Next.js 内置模块
  - `next/font/google` - Google 字体
  - `next/font/local` - 本地字体
  - `next/navigation` - 导航钩子
  - `next/server` - 服务器组件
  - `next/image` - 优化的图片组件
  - `next/link` - 链接组件
  - `next/headers` - Headers API
  - `next/cache` - 缓存 API
  - `next/og` - Open Graph 图片生成
  - `next/intl` - 国际化支持

> **注意**: 完整的 Next.js 模式列表在 `scripts/eslint-config-constants.js` 中定义

#### 服务 (`services/`)
- `import/no-internal-modules`: **warn** (允许包导入)
- 允许的导入模式:
  - `./**` - 相对导入
  - `../**` - 父目录导入
  - `@athlete-ally/**` - 内部包

#### 包 (`packages/`)
- `import/no-internal-modules`: **warn** (严格边界，但允许提交)
- 允许的导入模式:
  - `./**` - 相对导入
  - `../**` - 父目录导入
  - `@athlete-ally/**` - 内部包
- 注意: 某些相对导入可能仍显示警告，但不会阻止提交

#### 脚本 (`scripts/`)
- `import/no-internal-modules`: **off** (宽松规则)
- 允许所有导入模式

### 反回归保护

CI 会自动检查:
1. 工作流中是否有内联 `--rule` 覆盖
2. 是否有替代配置文件
3. 关键规则的严重性是否正确

### 常见问题

#### Q: 为什么 `next/font/google` 导入失败？
A: 确保使用统一配置，不要使用内联 `--rule` 参数。

#### Q: 如何添加新的边界规则？
A: 在 `eslint.config.unified.mjs` 中修改相应文件模式的规则。

#### Q: 为什么包之间的导入被阻止？
A: 包应该通过 `@athlete-ally/` 命名空间导入，而不是相对路径。

### 迁移指南

从旧配置迁移:
1. 移除所有 `--rule` 参数
2. 使用 `--config eslint.config.unified.mjs`
3. 更新工作流和脚本
4. 测试配置一致性
