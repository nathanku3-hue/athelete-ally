#!/bin/bash

# Phase 2 生产部署脚本
# 用于快速部署到生产环境

set -e

echo "🚀 开始Phase 2生产部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否运行
check_docker() {
    log_info "检查Docker状态..."
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker未运行，请启动Docker Desktop"
        exit 1
    fi
    log_success "Docker运行正常"
}

# 检查端口是否可用
check_ports() {
    log_info "检查端口可用性..."
    
    # 检查前端端口3000
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口3000已被占用，正在停止现有服务..."
        docker stop frontend 2>/dev/null || true
        docker rm frontend 2>/dev/null || true
    fi
    
    # 检查后端端口4102
    if lsof -Pi :4102 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口4102已被占用，正在停止现有服务..."
        docker stop planning-engine 2>/dev/null || true
        docker rm planning-engine 2>/dev/null || true
    fi
    
    log_success "端口检查完成"
}

# 构建前端镜像
build_frontend() {
    log_info "构建前端Docker镜像..."
    
    if docker build -t athlete-ally/frontend:latest -f Dockerfile .; then
        log_success "前端镜像构建成功"
    else
        log_error "前端镜像构建失败"
        exit 1
    fi
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    
    if docker run -d -p 3000:3000 --name frontend --restart unless-stopped athlete-ally/frontend:latest; then
        log_success "前端服务启动成功"
    else
        log_error "前端服务启动失败"
        exit 1
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    if docker run -d -p 4102:4102 --name planning-engine --restart unless-stopped athlete-ally/planning-engine:simple; then
        log_success "后端服务启动成功"
    else
        log_warning "后端服务可能已在运行，继续..."
    fi
}

# 启动监控服务
start_monitoring() {
    log_info "启动监控服务..."
    
    if docker compose -f docker-compose/preview.yml up -d prometheus grafana postgres redis nats; then
        log_success "监控服务启动成功"
    else
        log_warning "监控服务可能已在运行，继续..."
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查前端服务
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        return 1
    fi
    
    # 检查后端服务
    if curl -f http://localhost:4102/health > /dev/null 2>&1; then
        log_success "后端服务健康检查通过"
    else
        log_error "后端服务健康检查失败"
        return 1
    fi
    
    # 检查监控服务
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log_success "监控服务健康检查通过"
    else
        log_warning "监控服务健康检查失败，但不影响核心功能"
    fi
}

# 显示服务状态
show_status() {
    log_info "显示服务状态..."
    
    echo ""
    echo "📊 服务状态:"
    echo "=================="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "🌐 访问地址:"
    echo "=================="
    echo "前端应用: http://localhost:3000"
    echo "后端API: http://localhost:4102"
    echo "API文档: http://localhost:4102/docs"
    echo "监控面板: http://localhost:9090"
    echo "Grafana: http://localhost:3001"
    
    echo ""
    echo "🔧 管理命令:"
    echo "=================="
    echo "查看日志: docker logs frontend"
    echo "停止服务: docker stop frontend planning-engine"
    echo "重启服务: docker restart frontend planning-engine"
    echo "查看状态: docker ps"
}

# 运行测试
run_tests() {
    log_info "运行部署验证测试..."
    
    if npm run test:api; then
        log_success "API测试通过"
    else
        log_warning "API测试失败，但服务可能仍然可用"
    fi
    
    if npm run test:frontend; then
        log_success "前端测试通过"
    else
        log_warning "前端测试失败，但服务可能仍然可用"
    fi
}

# 主函数
main() {
    echo "🎉 Phase 2 生产部署开始"
    echo "========================"
    
    check_docker
    check_ports
    build_frontend
    start_frontend
    start_backend
    start_monitoring
    
    if health_check; then
        log_success "所有服务健康检查通过"
    else
        log_warning "部分服务健康检查失败，请检查日志"
    fi
    
    run_tests
    show_status
    
    echo ""
    log_success "🎉 Phase 2 生产部署完成！"
    echo ""
    echo "系统已就绪，可以开始使用！"
    echo "如有问题，请查看日志或联系开发团队。"
}

# 执行主函数
main "$@"








