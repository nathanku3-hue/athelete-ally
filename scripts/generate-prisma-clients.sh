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
    
    # Generate to service-local output path
    (cd "$service" && npx prisma generate)
    
    # Verify generation
    if [ -d "$service/prisma/generated/client" ]; then
      echo "✅ $service_name Prisma client generated successfully"
    else
      echo "❌ $service_name Prisma client generation failed"
      exit 1
    fi
  fi
done

echo "✅ All Prisma clients generated"
