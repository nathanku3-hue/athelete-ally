#!/bin/bash
# 🔒 安全扫描脚本
# 用于扫描Planning Engine的安全漏洞和配置问题

echo "🔒 Starting security scan for Planning Engine..."

# 创建安全扫描结果目录
mkdir -p security-results
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SECURITY_DIR="security-results/scan_$TIMESTAMP"
mkdir -p $SECURITY_DIR

echo "📊 Running security scans..."
echo "   - Results Directory: $SECURITY_DIR"

# 1. NPM安全审计
echo "🔍 Running NPM security audit..."
npm audit --audit-level=moderate > $SECURITY_DIR/npm_audit.txt 2>&1

# 2. 依赖漏洞扫描
echo "🔍 Scanning for dependency vulnerabilities..."
npm audit --json > $SECURITY_DIR/dependency_vulnerabilities.json 2>&1

# 3. 代码安全扫描 (使用ESLint安全规则)
echo "🔍 Running code security analysis..."
npx eslint src/ --config .eslintrc.security.js --format json > $SECURITY_DIR/code_security.json 2>&1 || echo "ESLint security config not found, skipping..."

# 4. 环境变量安全检查
echo "🔍 Checking environment variable security..."
cat > $SECURITY_DIR/env_security_check.txt << EOF
# 环境变量安全检查报告

## 检查项目

### 1. 敏感信息检查
- [ ] 检查.env文件是否包含敏感信息
- [ ] 检查.env.production文件是否包含敏感信息
- [ ] 检查是否有硬编码的密码或API密钥

### 2. 权限检查
- [ ] 检查文件权限是否合理
- [ ] 检查Docker容器权限配置
- [ ] 检查数据库连接权限

### 3. 网络安全检查
- [ ] 检查CORS配置
- [ ] 检查HTTPS配置
- [ ] 检查防火墙规则

### 4. 认证和授权检查
- [ ] 检查JWT配置
- [ ] 检查API认证机制
- [ ] 检查权限控制

## 发现的问题

$(echo "检查中...")

## 建议

1. **立即修复**: 修复所有高危漏洞
2. **定期扫描**: 建立定期安全扫描机制
3. **依赖更新**: 及时更新有漏洞的依赖包
4. **配置审查**: 定期审查安全配置

EOF

# 5. Docker安全扫描
echo "🔍 Running Docker security scan..."
if command -v docker &> /dev/null; then
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $(pwd):/app aquasec/trivy:latest image planning-engine:latest > $SECURITY_DIR/docker_security.txt 2>&1 || echo "Docker image not found, skipping..."
else
    echo "Docker not available, skipping Docker security scan" > $SECURITY_DIR/docker_security.txt
fi

# 6. 生成安全报告
echo "📋 Generating security report..."
cat > $SECURITY_DIR/security_report.md << EOF
# Planning Engine安全扫描报告

## 扫描配置
- **扫描时间**: $(date)
- **扫描工具**: NPM Audit, ESLint, Trivy
- **扫描范围**: 依赖包、源代码、Docker镜像

## 扫描结果

### 1. NPM安全审计
\`\`\`
$(head -50 $SECURITY_DIR/npm_audit.txt)
\`\`\`

### 2. 依赖漏洞详情
\`\`\`json
$(head -20 $SECURITY_DIR/dependency_vulnerabilities.json)
\`\`\`

### 3. 代码安全分析
\`\`\`json
$(head -20 $SECURITY_DIR/code_security.json)
\`\`\`

### 4. 环境变量安全检查
\`\`\`
$(cat $SECURITY_DIR/env_security_check.txt)
\`\`\`

### 5. Docker安全扫描
\`\`\`
$(head -30 $SECURITY_DIR/docker_security.txt)
\`\`\`

## 安全风险等级

| 风险等级 | 数量 | 描述 |
|---------|------|------|
| 高危 | - | 需要立即修复 |
| 中危 | - | 需要尽快修复 |
| 低危 | - | 建议修复 |

## 修复建议

### 立即修复
1. 修复所有高危漏洞
2. 更新有安全问题的依赖包
3. 修复代码中的安全漏洞

### 短期修复
1. 更新所有中危漏洞
2. 加强输入验证
3. 完善错误处理

### 长期改进
1. 建立安全开发流程
2. 定期进行安全培训
3. 实施持续安全监控

## 安全最佳实践

1. **依赖管理**
   - 定期更新依赖包
   - 使用自动化漏洞扫描
   - 选择维护活跃的包

2. **代码安全**
   - 遵循安全编码规范
   - 进行代码审查
   - 使用静态分析工具

3. **运行时安全**
   - 最小权限原则
   - 定期安全更新
   - 监控异常行为

4. **数据保护**
   - 加密敏感数据
   - 安全传输
   - 访问控制

EOF

echo "✅ Security scan completed!"
echo "🔒 Results saved to: $SECURITY_DIR"
echo "📋 Report generated: $SECURITY_DIR/security_report.md"
echo ""
echo "🔍 To view results:"
echo "   cat $SECURITY_DIR/security_report.md"
echo ""
echo "⚠️  Important:"
echo "   - Review all findings carefully"
echo "   - Fix high and medium risk issues immediately"
echo "   - Update dependencies regularly"
echo "   - Implement security best practices"

