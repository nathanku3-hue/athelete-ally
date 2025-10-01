#!/bin/bash

# Prisma Migration Safety Script
# Ensures proper migration strategy based on environment

set -e

SERVICE_DIR="${1:-.}"

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "❌ Production environment detected. Refusing to run 'prisma db push'"
  echo "✅ Use 'prisma migrate deploy' for production deployments"
  exit 1
fi

# Check if service directory has Prisma schema
if [ ! -f "$SERVICE_DIR/prisma/schema.prisma" ]; then
  echo "⚠️  No Prisma schema found at $SERVICE_DIR/prisma/schema.prisma"
  echo "Skipping Prisma sync for $SERVICE_DIR"
  exit 0
fi

# Echo target database host for safety
if [ -n "$DATABASE_URL" ]; then
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
  echo "🎯 Target database host: ${DB_HOST:-unknown}"
fi

# Check if we're in CI
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "🔧 CI environment detected. Running 'prisma db push' for $SERVICE_DIR"
  cd "$SERVICE_DIR" && npx prisma db push --skip-generate
else
  echo "🔧 Development environment detected. Running 'prisma db push' for $SERVICE_DIR"
  cd "$SERVICE_DIR" && npx prisma db push
fi

echo "✅ Database schema synchronized successfully for $SERVICE_DIR"
