#!/usr/bin/env bash
# Generate Prisma clients for all services
# Usage: ./scripts/generate-prisma-clients.sh

set -euo pipefail

echo "🔧 Generating Prisma clients for all services..."

# Unified generation logic for all services
for service in services/*/; do
  if [ -f "$service/prisma/schema.prisma" ]; then
    service_name=$(basename "$service")
    echo "Generating Prisma client for $service_name..."
    
    # Try workspace command first, fallback to direct prisma generate
    if [ "$service_name" = "planning-engine" ]; then
      npm run db:generate -w services/planning-engine || (cd "$service" && npx prisma generate)
    else
      (cd "$service" && npx prisma generate)
    fi
  fi
done

echo "✅ All Prisma clients generated"
