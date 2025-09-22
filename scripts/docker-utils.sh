#!/bin/bash
# Docker工具脚本 - 统一管理Docker Compose命令
# 避免重复的命令定义

set -e

COMPOSE_FILE="./preview.compose.yaml"

# 检查Docker Compose文件是否存在
check_compose_file() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Docker Compose file not found: $COMPOSE_FILE"
    exit 1
  fi
}

# 检查Docker是否运行
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
  fi
}

# 启动基础设施服务
start_infra() {
  check_docker
  check_compose_file
  echo "🐳 Starting infrastructure services..."
  docker compose -f "$COMPOSE_FILE" up -d postgres redis nats
}

# 停止基础设施服务
stop_infra() {
  check_compose_file
  echo "🛑 Stopping infrastructure services..."
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
}

# 显示服务状态
show_status() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" ps
}

# 显示服务日志
show_logs() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" logs "$@"
}

# 重启服务
restart_service() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" restart "$@"
}

# 主函数
main() {
  case "$1" in
    "start")
      start_infra
      ;;
    "stop")
      stop_infra
      ;;
    "status")
      show_status
      ;;
    "logs")
      shift
      show_logs "$@"
      ;;
    "restart")
      shift
      restart_service "$@"
      ;;
    *)
      echo "Usage: $0 {start|stop|status|logs|restart}"
      echo "  start   - Start infrastructure services"
      echo "  stop    - Stop infrastructure services"
      echo "  status  - Show service status"
      echo "  logs    - Show service logs"
      echo "  restart - Restart specific service"
      exit 1
      ;;
  esac
}

main "$@"
