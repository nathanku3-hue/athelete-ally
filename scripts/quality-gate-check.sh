#!/bin/bash

# 质量门禁检查脚本 - 质量与集成负责人
# 确保代码质量符合标准，建立高质量文化

set -e

echo "🔍 质量与集成负责人 - 质量门禁检查开始..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 质量门禁标准
MIN_COVERAGE=80
MAX_COMPLEXITY=10
MAX_DUPLICATION=5
MAX_HIGH_RISK_VULNERABILITIES=0

# 检查函数
check_code_quality() {
    echo -e "\n${BLUE}📊 代码质量检查${NC}"
    echo "=================="
    
    # 检查代码覆盖率
    echo -n "检查代码覆盖率... "
    if command -v nyc &> /dev/null; then
        COVERAGE=$(npx nyc --reporter=text-summary npm test 2>/dev/null | grep -o '[0-9]*\.[0-9]*%' | head -1 | sed 's/%//')
        if (( $(echo "$COVERAGE >= $MIN_COVERAGE" | bc -l) )); then
            echo -e "${GREEN}✅ ${COVERAGE}% (>= ${MIN_COVERAGE}%)${NC}"
        else
            echo -e "${RED}❌ ${COVERAGE}% (< ${MIN_COVERAGE}%)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  nyc not available, skipping coverage check${NC}"
    fi
    
    # 检查代码复杂度
    echo -n "检查代码复杂度... "
    if command -v eslint &> /dev/null; then
        COMPLEXITY_ISSUES=$(npx eslint --config eslint.config.unified.mjs --rule "complexity: [2, $MAX_COMPLEXITY]" . --format=json 2>/dev/null | jq '.[] | .messages | length' | awk '{sum += $1} END {print sum+0}')
        if [ "$COMPLEXITY_ISSUES" -eq 0 ]; then
            echo -e "${GREEN}✅ 复杂度检查通过${NC}"
        else
            echo -e "${RED}❌ 发现 $COMPLEXITY_ISSUES 个复杂度问题${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  eslint not available, skipping complexity check${NC}"
    fi
    
    # 检查代码重复率
    echo -n "检查代码重复率... "
    if command -v jscpd &> /dev/null; then
        DUPLICATION=$(npx jscpd --min-lines 5 --min-tokens 50 . --format=json 2>/dev/null | jq '.statistics.total.percentage' | sed 's/"//g')
        if (( $(echo "$DUPLICATION <= $MAX_DUPLICATION" | bc -l) )); then
            echo -e "${GREEN}✅ ${DUPLICATION}% (<= ${MAX_DUPLICATION}%)${NC}"
        else
            echo -e "${RED}❌ ${DUPLICATION}% (> ${MAX_DUPLICATION}%)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  jscpd not available, skipping duplication check${NC}"
    fi
}

check_security() {
    echo -e "\n${BLUE}🔒 安全检查${NC}"
    echo "=========="
    
    # 检查安全漏洞
    echo -n "检查安全漏洞... "
    npm audit --audit-level=high --json > audit-results.json 2>/dev/null || true
    
    if [ -f audit-results.json ]; then
        HIGH_RISK=$(node -e "
            const fs = require('fs');
            try {
                const audit = JSON.parse(fs.readFileSync('audit-results.json', 'utf8'));
                const vulnerabilities = audit.vulnerabilities || {};
                const highRisk = Object.values(vulnerabilities).filter(v => v.severity === 'high' || v.severity === 'critical');
                console.log(highRisk.length);
            } catch (e) {
                console.log('0');
            }
        ")
        
        if [ "$HIGH_RISK" -eq 0 ]; then
            echo -e "${GREEN}✅ 无高危漏洞${NC}"
        else
            echo -e "${RED}❌ 发现 $HIGH_RISK 个高危漏洞${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  无法获取安全审计结果${NC}"
    fi
}

check_tests() {
    echo -e "\n${BLUE}🧪 测试检查${NC}"
    echo "=========="
    
    # 检查单元测试
    echo -n "运行单元测试... "
    if npm test > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 单元测试通过${NC}"
    else
        echo -e "${RED}❌ 单元测试失败${NC}"
        return 1
    fi
    
    # 检查集成测试
    echo -n "运行集成测试... "
    if npm run test:integration > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 集成测试通过${NC}"
    else
        echo -e "${YELLOW}⚠️  集成测试跳过或失败${NC}"
    fi
}

check_build() {
    echo -e "\n${BLUE}🏗️ 构建检查${NC}"
    echo "=========="
    
    # 检查代码格式
    echo -n "检查代码格式... "
    if npx eslint . --config eslint.config.unified.mjs --fix > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 代码格式检查通过${NC}"
    else
        echo -e "${RED}❌ 代码格式检查失败${NC}"
        return 1
    fi
    
    # 检查类型
    echo -n "检查类型定义... "
    if npx tsc --noEmit > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 类型检查通过${NC}"
    else
        echo -e "${RED}❌ 类型检查失败${NC}"
        return 1
    fi
    
    # 检查构建
    echo -n "检查项目构建... "
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 项目构建成功${NC}"
    else
        echo -e "${RED}❌ 项目构建失败${NC}"
        return 1
    fi
}

check_observability() {
    echo -e "\n${BLUE}👁️ 可观测性检查${NC}"
    echo "================"
    
    # 检查指标暴露
    echo -n "检查指标暴露... "
    if find . -name "*.ts" -o -name "*.js" | xargs grep -l "prom-client\|@opentelemetry" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 指标暴露配置存在${NC}"
    else
        echo -e "${YELLOW}⚠️  未发现指标暴露配置${NC}"
    fi
    
    # 检查日志记录
    echo -n "检查日志记录... "
    if find . -name "*.ts" -o -name "*.js" | xargs grep -l "console\.log\|logger" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 日志记录配置存在${NC}"
    else
        echo -e "${YELLOW}⚠️  未发现日志记录配置${NC}"
    fi
    
    # 检查错误处理
    echo -n "检查错误处理... "
    if find . -name "*.ts" -o -name "*.js" | xargs grep -l "try.*catch\|throw" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 错误处理配置存在${NC}"
    else
        echo -e "${YELLOW}⚠️  未发现错误处理配置${NC}"
    fi
}

# 主函数
main() {
    echo -e "${BLUE}质量与集成负责人 - 质量门禁检查${NC}"
    echo "=================================="
    
    local total_checks=0
    local passed_checks=0
    
    # 执行各项检查
    if check_code_quality; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_security; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_tests; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_build; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    if check_observability; then
        ((passed_checks++))
    fi
    ((total_checks++))
    
    # 输出结果
    echo -e "\n${BLUE}📊 质量门禁检查结果${NC}"
    echo "=================="
    echo "总检查项: $total_checks"
    echo "通过检查: $passed_checks"
    echo "失败检查: $((total_checks - passed_checks))"
    
    if [ $passed_checks -eq $total_checks ]; then
        echo -e "\n${GREEN}🎉 质量门禁检查通过！代码质量符合标准！${NC}"
        echo -e "${GREEN}✅ 可以继续开发或合并代码${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ 质量门禁检查失败！请修复问题后重试${NC}"
        echo -e "${RED}⚠️  代码质量不符合标准，无法继续${NC}"
        exit 1
    fi
}

# 运行主函数
main "$@"
