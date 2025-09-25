#!/bin/bash
# Generate Prisma clients for all services
# Usage: ./scripts/generate-prisma-clients.sh

set -euo pipefail

echo "🔧 Generating Prisma clients for all services..."

# Generate for planning-engine specifically
if [ -f "services/planning-engine/prisma/schema.prisma" ]; then
  echo "Generating Prisma client for planning-engine..."
  npm run db:generate -w services/planning-engine || (cd services/planning-engine && npx prisma generate)
fi

# Generate for other services
for service in services/*/; do
  if [ -f "$service/prisma/schema.prisma" ] && [ "$service" != "services/planning-engine/" ]; then
    echo "Generating Prisma client for $(basename "$service")..."
    cd "$service"
    npx prisma generate
    cd - > /dev/null
  fi
done

echo "✅ All Prisma clients generated"
