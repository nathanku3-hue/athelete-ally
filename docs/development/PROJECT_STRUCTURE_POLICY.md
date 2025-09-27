# 项目结构政策

## 🎯 目标
确保项目文件结构始终保持最优状态，杜绝文件冗杂问题。

## 📁 标准目录结构

```
athlete-ally-original/
├── .github/               # GitHub Actions CI/CD
├── apps/                  # 应用程序
│   ├── frontend/          # 前端应用
│   └── gateway-bff/       # API网关
├── services/              # 后端微服务
├── packages/              # 共享库和工具
├── docs/                  # 项目文档
│   ├── guides/           # 操作指南
│   ├── reports/          # 技术报告
│   └── features/         # 功能定义
├── infrastructure/        # 基础设施配置
│   └── config/           # 环境配置
├── monitoring/            # 监控配置
├── prisma/               # 数据库ORM
├── scripts/              # 构建和部署脚本
├── .dockerignore         # Docker忽略文件
├── .gitignore            # Git忽略文件
├── .nvmrc                # Node.js版本
├── CONTRIBUTING.md       # 贡献指南
├── README.md             # 项目说明
├── package.json          # 项目配置
├── package-lock.json     # 依赖锁定
├── tsconfig.json         # TypeScript配置
├── tsconfig.base.json    # TypeScript基础配置
├── turbo.json            # Turborepo配置
├── eslint.config.mjs     # ESLint配置
├── jest.config.js        # Jest测试配置
├── docker-compose.v3.yml # Docker Compose配置
├── Dockerfile            # Docker构建文件
├── Dockerfile # 生产环境Docker文件
├── docker-compose/preview.yml  # 预览环境配置
├── env.example           # 环境变量示例
└── env.development.example # 开发环境示例
```

## 🚫 禁止在根目录放置的文件

### 可执行文件
- `*.exe`
- `*.dmg`
- `*.pkg`
- `*.deb`
- `*.rpm`

### 压缩文件
- `*.zip`
- `*.tar.gz`
- `*.rar`
- `*.7z`

### 临时文件
- `*.tmp`
- `*.temp`
- `*.swp`
- `*.swo`
- `*~`

### 构建产物
- `.next/`
- `.turbo/`
- `dist/`
- `build/`
- `out/`
- `coverage/`
- `*.tsbuildinfo`

### 状态文件
- `*REPORT*.md`
- `*SUMMARY*.md`
- `*GUIDE*.md`
- `*PLAN*.md`
- `*FIX*.md`
- `*DEBUG*.md`

## ✅ 文件放置规则

### 配置文件
- **前端配置**: `apps/frontend/`
- **后端配置**: `services/*/`
- **全局配置**: 根目录（如 `package.json`, `tsconfig.json`）
- **环境配置**: `infrastructure/config/`

### 脚本文件
- **部署脚本**: `scripts/`
- **构建脚本**: `scripts/`
- **测试脚本**: `scripts/`

### 文档文件
- **技术报告**: `docs/reports/`
- **操作指南**: `docs/guides/`
- **功能定义**: `docs/features/`

### 监控配置
- **Grafana仪表板**: `monitoring/`
- **Prometheus配置**: `monitoring/`
- **ELK配置**: `services/*/elk/`

## 🔍 代码审查检查点

### Pull Request审查时必须检查
1. **新文件位置**: 是否放在正确的目录？
2. **文件命名**: 是否符合命名规范？
3. **冗余文件**: 是否有不必要的文件？
4. **临时文件**: 是否清理了临时文件？
5. **构建产物**: 是否提交了构建产物？

### 提交前自检清单
- [ ] 没有可执行文件（*.exe等）
- [ ] 没有压缩文件（*.zip等）
- [ ] 没有临时文件（*.tmp等）
- [ ] 没有构建产物（.next/, dist/等）
- [ ] 没有状态报告文件（*REPORT*.md等）
- [ ] 所有文件都在正确的目录
- [ ] 更新了.gitignore（如需要）

## 🛠️ 自动化检查

### CI/CD检查
- 文件模式检查
- 文件大小限制
- 目录结构验证

### Pre-commit Hooks
- 自动清理临时文件
- 检查文件命名规范
- 验证目录结构

## 📋 维护任务

### 每周检查
- 清理临时文件
- 检查构建产物
- 验证目录结构

### 每月审查
- 更新.gitignore
- 优化目录结构
- 清理冗余文件

## 🚨 违规处理

### 轻微违规
- 提醒开发者
- 要求重新组织文件

### 严重违规
- 拒绝合并PR
- 要求完整重构

## 📞 联系信息

如有疑问，请联系项目维护者。
