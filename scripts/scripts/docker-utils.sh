#!/bin/bash
# Docker???? - ????Docker Compose?? (Bash??)
# ?????????
#
# ??:
# - ???????? (postgres, redis, nats)
# - ?????????????
# - ??????
# - ??Docker?Compose?????
#
# ????:
#   ./scripts/docker-utils.sh start   # ????
#   ./scripts/docker-utils.sh stop    # ????
#   ./scripts/docker-utils.sh status  # ????

set -e

COMPOSE_FILE="./preview.compose.yaml"

# ??Docker Compose??????
check_compose_file() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    echo "? Docker Compose file not found: $COMPOSE_FILE"
    exit 1
  fi
}

# ??Docker????
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "? Docker is not running. Please start Docker first."
    exit 1
  fi
}

# ????????
start_infra() {
  check_docker
  check_compose_file
  
  echo "?? Starting infrastructure services..."
  echo "   PostgreSQL: ${POSTGRES_PORT:-5432}"
  echo "   Redis: ${REDIS_PORT:-6379}"
  echo "   NATS: ${NATS_PORT:-4222}"
  
  docker compose -f "$COMPOSE_FILE" up -d postgres redis nats
}

# ????????
stop_infra() {
  check_compose_file
  echo "?? Stopping infrastructure services..."
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans
}

# ??????
show_status() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" ps
}

# ??????
show_logs() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" logs "$@"
}

# ????
restart_service() {
  check_compose_file
  docker compose -f "$COMPOSE_FILE" restart "$@"
}

# ???
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

