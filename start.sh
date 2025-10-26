#!/bin/sh
echo "Starting planning-engine..."
echo "Current directory: $(pwd)"
echo "Checking for dist directory..."
ls -la services/planning-engine/dist/ || echo "ERROR: dist directory not found!"
echo "NODE_ENV=${NODE_ENV}"
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo 'YES' || echo 'NO')"
echo "Starting Node.js..."
exec node services/planning-engine/dist/index.js
