#!/bin/bash
# ✅ 生产环境验证脚本
# 用于验证生产环境部署是否成功

echo "✅ Starting production environment validation..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 验证函数
validate_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "🔍 Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# 验证服务健康状态
validate_health() {
    local url=$1
    local name=$2
    
    echo -n "🔍 Testing $name health... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q '"status":"healthy"'; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY${NC}"
        echo "Response: $response"
        return 1
    fi
}

# 验证指标数据
validate_metrics() {
    local url=$1
    local name=$2
    
    echo -n "🔍 Testing $name metrics... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "http_requests_total"; then
        echo -e "${GREEN}✅ METRICS AVAILABLE${NC}"
        return 0
    else
        echo -e "${RED}❌ NO METRICS${NC}"
        echo "Response: $response"
        return 1
    fi
}

# 验证容器状态
validate_containers() {
    echo "🔍 Checking container status..."
    
    if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Containers are running${NC}"
        docker-compose -f docker-compose.production.yml ps
        return 0
    else
        echo -e "${RED}❌ Some containers are not running${NC}"
        docker-compose -f docker-compose.production.yml ps
        return 1
    fi
}

# 验证日志
validate_logs() {
    echo "🔍 Checking for errors in logs..."
    
    error_count=$(docker-compose -f docker-compose.production.yml logs planning-engine 2>/dev/null | grep -i error | wc -l)
    
    if [ "$error_count" -eq 0 ]; then
        echo -e "${GREEN}✅ No errors found in logs${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Found $error_count errors in logs${NC}"
        echo "Recent errors:"
        docker-compose -f docker-compose.production.yml logs planning-engine 2>/dev/null | grep -i error | tail -5
        return 1
    fi
}

# 验证性能
validate_performance() {
    echo "🔍 Testing API performance..."
    
    start_time=$(date +%s%3N)
    response=$(curl -s "http://localhost:4102/health" 2>/dev/null)
    end_time=$(date +%s%3N)
    
    response_time=$((end_time - start_time))
    
    if [ "$response_time" -lt 1000 ]; then
        echo -e "${GREEN}✅ Performance good${NC} (${response_time}ms)"
        return 0
    elif [ "$response_time" -lt 3000 ]; then
        echo -e "${YELLOW}⚠️  Performance acceptable${NC} (${response_time}ms)"
        return 0
    else
        echo -e "${RED}❌ Performance poor${NC} (${response_time}ms)"
        return 1
    fi
}

# 主验证流程
echo "🚀 Starting comprehensive production validation..."
echo ""

# 1. 验证容器状态
validate_containers
container_status=$?

echo ""

# 2. 验证基础端点
echo "📡 Testing API endpoints..."
validate_endpoint "http://localhost:4102/health" "Health Check"
health_status=$?

validate_endpoint "http://localhost:4102/health/detailed" "Detailed Health Check"
detailed_health_status=$?

validate_endpoint "http://localhost:4102/api/docs" "API Documentation"
docs_status=$?

validate_endpoint "http://localhost:4102/metrics" "Metrics Endpoint"
metrics_status=$?

echo ""

# 3. 验证健康状态
echo "🏥 Testing service health..."
validate_health "http://localhost:4102/health" "Planning Engine"
service_health=$?

echo ""

# 4. 验证指标数据
echo "📊 Testing metrics data..."
validate_metrics "http://localhost:4102/metrics" "Prometheus Metrics"
metrics_data=$?

echo ""

# 5. 验证日志
validate_logs
logs_status=$?

echo ""

# 6. 验证性能
validate_performance
performance_status=$?

echo ""

# 7. 验证外部服务
echo "🔗 Testing external service connections..."
validate_endpoint "http://localhost:9090" "Prometheus" 200
prometheus_status=$?

validate_endpoint "http://localhost:3000" "Grafana" 200
grafana_status=$?

echo ""

# 总结验证结果
echo "📋 Validation Summary:"
echo "======================"

total_tests=8
passed_tests=0

[ $container_status -eq 0 ] && ((passed_tests++))
[ $health_status -eq 0 ] && ((passed_tests++))
[ $detailed_health_status -eq 0 ] && ((passed_tests++))
[ $docs_status -eq 0 ] && ((passed_tests++))
[ $metrics_status -eq 0 ] && ((passed_tests++))
[ $service_health -eq 0 ] && ((passed_tests++))
[ $metrics_data -eq 0 ] && ((passed_tests++))
[ $logs_status -eq 0 ] && ((passed_tests++))

echo "✅ Passed: $passed_tests/$total_tests tests"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 All validation tests passed! Production environment is ready.${NC}"
    echo ""
    echo "🔗 Service URLs:"
    echo "   Health Check: http://localhost:4102/health"
    echo "   API Docs: http://localhost:4102/api/docs"
    echo "   Metrics: http://localhost:4102/metrics"
    echo "   Prometheus: http://localhost:9090"
    echo "   Grafana: http://localhost:3000"
    exit 0
else
    echo -e "${RED}❌ Some validation tests failed. Please check the issues above.${NC}"
    exit 1
fi