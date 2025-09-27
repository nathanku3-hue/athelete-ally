#!/bin/bash
# scripts/verify-ci-config.sh - CI??????

echo "?? Verifying CI configuration..."

# ??????
docker compose -f ./preview.compose.yaml -f ./docker-compose.ci.yml config > final-config.yml

# ??????
if grep -q '^\s*ports:' final-config.yml; then
  echo "? Ports still present in CI config:"
  grep -n '^\s*ports:' final-config.yml
  exit 1
else
  echo "? No ports found in CI config - isolation working"
fi

# ??CI????
echo "?? Testing CI environment isolation..."
docker compose -p test_ci_12345 -f ./preview.compose.yaml -f ./docker-compose.ci.yml up -d postgres redis nats

# ??????
docker compose -p test_ci_12345 -f ./preview.compose.yaml ps

# ???????
docker compose -p test_ci_12345 -f ./preview.compose.yaml exec redis redis-cli ping
docker compose -p test_ci_12345 -f ./preview.compose.yaml exec postgres pg_isready -U athlete

# ??????
docker compose -p test_ci_12345 -f ./preview.compose.yaml down -v --remove-orphans

echo "? CI configuration verification complete"

