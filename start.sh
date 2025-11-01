#!/bin/sh
set -e  # Exit on any error

echo "=== RAILWAY STARTUP DEBUG ==="
echo "Current directory: $(pwd)"
echo "NODE_ENV=${NODE_ENV}"
echo "PORT=${PORT}"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"

echo "=== Checking build artifacts ==="
ls -la services/planning-engine/ || echo "ERROR: planning-engine directory not found!"
ls -la services/planning-engine/dist/ || echo "ERROR: dist directory not found!"

echo "=== Starting planning-engine ==="
exec node services/planning-engine/dist/index.js
