#!/bin/bash

echo "🔧 Generating Prisma clients for all services..."

# List of services with Prisma schemas
services=(
    "services/normalize-service"
    "services/workouts"
    "services/exercises"
    "services/fatigue"
    "services/insights-engine"
    "services/planning-engine"
    "services/profile-onboarding"
    "services/protocol-engine"
)

# Generate Prisma clients for each service
for service in "${services[@]}"; do
    if [ -d "$service" ] && [ -f "$service/prisma/schema.prisma" ]; then
        echo "Generating Prisma client for $service..."
        cd "$service"
        npx prisma generate
        cd - > /dev/null
        echo "✅ Generated Prisma client for $service"
    else
        echo "⚠️  Skipping $service (no Prisma schema found)"
    fi
done

echo "🎉 Prisma client generation completed!"
