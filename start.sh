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
# Try multiple possible locations
if [ -f "services/planning-engine/dist/index.js" ]; then
  echo "Found at: services/planning-engine/dist/index.js"
  exec node services/planning-engine/dist/index.js
elif [ -f "services/planning-engine/dist/src/index.js" ]; then
  echo "Found at: services/planning-engine/dist/src/index.js"
  exec node services/planning-engine/dist/src/index.js
else
  echo "ERROR: index.js not found in expected locations!"
  echo "Full file search:"
  find services/planning-engine/dist -type f -name "*.js" | head -20
  exit 1
fi
