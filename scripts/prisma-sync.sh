#!/bin/bash

# Prisma Migration Safety Script
# Ensures proper migration strategy based on environment

set -euo pipefail

SERVICE_DIR="${1:-.}"

# Check if we're in production
if [ "${NODE_ENV:-}" = "production" ]; then
  echo "❌ Production environment detected. Refusing to run 'prisma db push'"
  echo "✅ Use 'prisma migrate deploy' for production deployments"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "⚠️  DATABASE_URL is not set. Skipping 'prisma db push'."
  echo "   Please ensure DATABASE_URL is configured for development/CI environments."
  exit 1
fi

# Check if we're in CI (required for db push)
if [ "${CI:-}" != "true" ] && [ "${GITHUB_ACTIONS:-}" != "true" ]; then
  echo "⚠️  Not in CI environment. Skipping 'prisma db push'."
  echo "   This script is designed for CI environments only."
  echo "   For local development, run 'prisma db push' manually."
  exit 1
fi

# Check if service directory has Prisma schema
if [ ! -f "$SERVICE_DIR/prisma/schema.prisma" ]; then
  echo "⚠️  No Prisma schema found at $SERVICE_DIR/prisma/schema.prisma"
  echo "Skipping Prisma sync for $SERVICE_DIR"
  exit 0
fi

# Echo target database host for safety
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p' || echo "unknown")
echo "🎯 Target database host: $DB_HOST"

echo "🔧 CI environment detected. Running 'prisma db push' for $SERVICE_DIR"
cd "$SERVICE_DIR" && npx prisma db push --skip-generate --accept-data-loss

echo "✅ Database schema synchronized successfully for $SERVICE_DIR"

