#!/bin/bash
# ?????????? (Bash??)
# ??Linux/macOS??????
#
# ??:
# - ??????? (5432, 6379, 4222)
# - ???????????????? (5433, 6380, 4222)
# - ?? PostgreSQL, Redis, NATS ??
# - ??????
#
# ????:
#   npm run infra:up
#   ?
#   ./scripts/infra-up.sh

set -e  # ???????

echo "?? Starting infrastructure services..."

# ???????
echo "?? Checking port availability..."
if ! npm run check-ports 5432 6379 4222; then
  echo "? Port check failed. Trying alternative ports..."
  if ! npm run check-ports 5433 6380 4222; then
    echo "? Alternative ports also failed."
    echo "?? Manual steps required:"
    echo "   1. Project-scoped cleanup:"
    echo "      docker compose -f ./preview.compose.yaml down -v --remove-orphans"
    echo "   2. Use alternative ports:"
    echo "      POSTGRES_PORT=5434 REDIS_PORT=6381 npm run infra:up"
    echo "   3. Check system services (last resort):"
    echo "      systemctl status postgresql redis"
    echo "   4. Manual process termination (last resort):"
    echo "      sudo kill -9 <process_id>"
    exit 1
  else
    echo "? Using alternative ports: 5433, 6380, 4222"
    export POSTGRES_PORT=5433
    export REDIS_PORT=6380
    export NATS_PORT=4222
  fi
fi

# ????
./scripts/docker-utils.sh start

echo "? Infrastructure services started"
echo "?? Service status:"
./scripts/docker-utils.sh status

