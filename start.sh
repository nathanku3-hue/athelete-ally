#!/bin/sh
set -e  # Exit on any error

echo "=== RAILWAY STARTUP DEBUG ==="
echo "Current directory: $(pwd)"
echo "NODE_ENV=${NODE_ENV}"
echo "PORT=${PORT}"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

echo "=== Checking build artifacts ==="
echo "Searching for index.js in planning-engine..."
find services/planning-engine -name "index.js" -type f 2>/dev/null | head -10

echo ""
echo "Checking dist structure:"
ls -R services/planning-engine/dist/ | head -50

echo ""
echo "=== Starting planning-engine ==="
# TypeScript outputs to dist/services/planning-engine/src/ due to baseUrl config
ENTRY_POINT="services/planning-engine/dist/services/planning-engine/src/index.js"

if [ -f "$ENTRY_POINT" ]; then
  echo "Starting from: $ENTRY_POINT"
  exec node "$ENTRY_POINT"
else
  echo "ERROR: Entry point not found at $ENTRY_POINT"
  echo "Searching for index.js..."
  find services/planning-engine/dist -name "index.js" -type f
  exit 1
fi
