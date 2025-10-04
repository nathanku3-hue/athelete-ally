#!/bin/bash
# 🚀 性能测试脚本
# 用于测试Planning Engine的性能和负载能力

echo "🚀 Starting performance tests for Planning Engine..."

# 设置测试参数
BASE_URL="http://localhost:4102"
CONCURRENT_USERS=10
TEST_DURATION=60s
RAMP_UP_TIME=10s

# 检查服务是否运行
echo "🔍 Checking if Planning Engine is running..."
if ! curl -f $BASE_URL/health > /dev/null 2>&1; then
    echo "❌ Planning Engine is not running. Please start the service first."
    exit 1
fi

echo "✅ Planning Engine is running"

# 创建测试结果目录
mkdir -p test-results
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="test-results/performance_$TIMESTAMP"
mkdir -p $RESULTS_DIR

echo "📊 Running performance tests..."
echo "   - Base URL: $BASE_URL"
echo "   - Concurrent Users: $CONCURRENT_USERS"
echo "   - Test Duration: $TEST_DURATION"
echo "   - Ramp Up Time: $RAMP_UP_TIME"
echo "   - Results Directory: $RESULTS_DIR"

# 健康检查性能测试
echo "🏥 Testing health check endpoint performance..."
hey -n 1000 -c $CONCURRENT_USERS -t $RAMP_UP_TIME $BASE_URL/health > $RESULTS_DIR/health_check.txt

# API文档性能测试
echo "📚 Testing API docs endpoint performance..."
hey -n 500 -c $CONCURRENT_USERS -t $RAMP_UP_TIME $BASE_URL/api/docs > $RESULTS_DIR/api_docs.txt

# 训练计划生成性能测试
echo "🏋️ Testing plan generation endpoint performance..."
hey -n 200 -c $CONCURRENT_USERS -t $RAMP_UP_TIME -m POST -H "Content-Type: application/json" -d '{"userId":"test-user","preferences":{"goal":"strength","experience":"intermediate"}}' $BASE_URL/api/v1/plans/enhanced/generate > $RESULTS_DIR/plan_generation.txt

# RPE反馈性能测试
echo "📊 Testing RPE feedback endpoint performance..."
hey -n 300 -c $CONCURRENT_USERS -t $RAMP_UP_TIME -m POST -H "Content-Type: application/json" -d '{"sessionId":"session-123","exerciseId":"ex-456","rpe":7,"completionRate":90}' $BASE_URL/api/v1/plans/feedback/rpe > $RESULTS_DIR/rpe_feedback.txt

# 适应性调整性能测试
echo "🔄 Testing adaptations endpoint performance..."
hey -n 200 -c $CONCURRENT_USERS -t $RAMP_UP_TIME $BASE_URL/api/v1/plans/plan-123/adaptations > $RESULTS_DIR/adaptations.txt

# 指标端点性能测试
echo "📈 Testing metrics endpoint performance..."
hey -n 1000 -c $CONCURRENT_USERS -t $RAMP_UP_TIME $BASE_URL/metrics > $RESULTS_DIR/metrics.txt

# 生成性能报告
echo "📋 Generating performance report..."
cat > $RESULTS_DIR/performance_report.md << EOF
# Planning Engine性能测试报告

## 测试配置
- **测试时间**: $(date)
- **基础URL**: $BASE_URL
- **并发用户数**: $CONCURRENT_USERS
- **测试持续时间**: $TEST_DURATION
- **预热时间**: $RAMP_UP_TIME

## 测试结果

### 健康检查端点
\`\`\`
$(head -20 $RESULTS_DIR/health_check.txt)
\`\`\`

### API文档端点
\`\`\`
$(head -20 $RESULTS_DIR/api_docs.txt)
\`\`\`

### 训练计划生成端点
\`\`\`
$(head -20 $RESULTS_DIR/plan_generation.txt)
\`\`\`

### RPE反馈端点
\`\`\`
$(head -20 $RESULTS_DIR/rpe_feedback.txt)
\`\`\`

### 适应性调整端点
\`\`\`
$(head -20 $RESULTS_DIR/adaptations.txt)
\`\`\`

### 指标端点
\`\`\`
$(head -20 $RESULTS_DIR/metrics.txt)
\`\`\`

## 性能指标总结

| 端点 | 平均响应时间 | 95%响应时间 | 99%响应时间 | 错误率 | QPS |
|------|-------------|-------------|-------------|--------|-----|
| 健康检查 | - | - | - | - | - |
| API文档 | - | - | - | - | - |
| 计划生成 | - | - | - | - | - |
| RPE反馈 | - | - | - | - | - |
| 适应性调整 | - | - | - | - | - |
| 指标 | - | - | - | - | - |

## 建议

1. **性能优化**: 根据测试结果进行针对性优化
2. **容量规划**: 基于QPS数据规划生产环境容量
3. **监控告警**: 设置基于性能指标的告警阈值
4. **负载均衡**: 考虑在高负载下使用负载均衡

EOF

echo "✅ Performance tests completed!"
echo "📊 Results saved to: $RESULTS_DIR"
echo "📋 Report generated: $RESULTS_DIR/performance_report.md"
echo ""
echo "🔍 To view results:"
echo "   cat $RESULTS_DIR/performance_report.md"
echo ""
echo "📈 Key metrics:"
echo "   - Check response times in each test result file"
echo "   - Monitor error rates and QPS"
echo "   - Review performance bottlenecks"

