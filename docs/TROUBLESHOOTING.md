# 故障排除指南

## 常见问题解决

### 端口冲突问题

#### Redis端口6379被占用
```bash
# 检查端口占用
npm run check-ports 6379

# 解决方案1: 停止冲突容器
docker ps | grep redis
docker stop <container_id>

# 解决方案2: 使用不同端口
REDIS_PORT=6380 npm run infra:up

# 解决方案3: 清理所有容器
npm run infra:clean
```

#### PostgreSQL端口5432被占用
```bash
# 检查端口占用
npm run check-ports 5432

# 解决方案1: 停止冲突容器
docker ps | grep postgres
docker stop <container_id>

# 解决方案2: 使用不同端口
POSTGRES_PORT=5433 npm run infra:up
```

### Docker容器管理问题

#### 问题: 容器启动失败
```bash
# 检查容器状态
docker compose -f ./preview.compose.yaml ps

# 清理并重启
npm run infra:down
npm run infra:up

# 查看日志
docker compose -f ./preview.compose.yaml logs
```

#### 问题: CI中的容器冲突
- CI使用唯一的项目名称避免冲突: `ci_${{ github.run_id }}`
- CI不绑定主机端口，使用内部网络通信
- 自动清理机制确保每次运行都是干净的环境

### Snyk认证问题

#### 问题: SNYK-0005认证错误
```bash
# 检查SNYK_TOKEN是否设置
echo $SNYK_TOKEN

# 解决方案1: 设置有效的SNYK_TOKEN
# 在GitHub Secrets中设置SNYK_TOKEN

# 解决方案2: 跳过Snyk扫描
# Snyk扫描是可选的，不会阻塞CI流程
```

### 环境变量问题

#### 问题: 环境变量未正确加载
```bash
# 验证环境变量
npm run validate-env

# 检查.env文件
cat .env

# 确保复制了env.example
cp env.example .env
```

## CI/CD问题

### 测试报告生成失败
- 确保测试报告作业有正确的checkout步骤
- 验证working-directory设置为${{ github.workspace }}
- 检查generate-test-report.js脚本路径

### ESLint配置问题
- 使用根目录的eslint.config.mjs
- 通过Turbo运行lint: `npx turbo run lint`
- 避免在包级别添加ESLint配置

## 开发环境问题

### 依赖安装问题
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查依赖冲突
npm ls
```

### TypeScript类型错误
```bash
# 运行类型检查
npm run type-check

# 检查特定包
npx turbo run type-check --filter=@athlete-ally/planning-engine
```

## 联系支持

如果问题仍然存在，请：
1. 检查GitHub Issues
2. 查看CI/CD日志
3. 联系开发团队

## 预防措施

### 定期维护
- 定期更新依赖: `npm update`
- 清理Docker资源: `npm run infra:clean`
- 检查端口冲突: `npm run check-ports`

### 最佳实践
- 使用环境变量而不是硬编码值
- 定期轮换安全令牌
- 保持Docker镜像更新
- 使用固定版本的GitHub Actions
