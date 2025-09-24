# Snyk 安全扫描配置指南

## 概述
Snyk 是一个安全漏洞扫描工具，用于检测项目依赖中的安全漏洞。

## 配置步骤

### 1. 获取 Snyk Token
1. 访问 [Snyk.io](https://snyk.io) 并注册账户
2. 登录后进入 Settings > General > API Token
3. 复制生成的 API Token

### 2. 配置 GitHub Secrets
1. 进入 GitHub 仓库的 Settings > Secrets and variables > Actions
2. 点击 "New repository secret"
3. 名称: `SNYK_TOKEN`
4. 值: 粘贴从 Snyk 获取的 API Token
5. 点击 "Add secret"

### 3. 验证配置
配置完成后，CI/CD 流水线将自动运行 Snyk 安全扫描。

## 故障排除

### 认证错误 (SNYK-0005)
如果遇到认证错误，请检查：
- SNYK_TOKEN 是否正确设置
- Token 是否有效且未过期
- Token 是否有足够的权限

### 跳过 Snyk 扫描
如果暂时无法配置 Snyk，CI 流水线仍会正常运行，只是会跳过 Snyk 扫描步骤。

## 相关文件
- `.github/workflows/ci.yml` - CI 流水线配置
- `package.json` - 项目依赖配置
