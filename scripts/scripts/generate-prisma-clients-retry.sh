#!/bin/bash

# Prisma Client Generation with Retry Logic
# Handles DNS issues and network failures with exponential backoff

set -euo pipefail

# Configuration
MAX_ATTEMPTS=3
BASE_DELAY=5
MAX_DELAY=30
PRISMA_MIRROR="https://cache.prisma.build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔧 Generating Prisma clients with retry logic..."

# Function to generate Prisma client for a single service
generate_service_client() {
    local service_dir="$1"
    local service_name=$(basename "$(dirname "$service_dir")")
    local attempt=1
    
    echo "📦 Processing $service_name..."
    
    while [ $attempt -le $MAX_ATTEMPTS ]; do
        echo "  🔄 Attempt $attempt/$MAX_ATTEMPTS for $service_name..."
        
        # Set Prisma mirror environment variable
        export PRISMA_ENGINES_MIRROR="$PRISMA_MIRROR"
        
        # Calculate delay for this attempt
        local delay=$((BASE_DELAY * (2 ** (attempt - 1))))
        if [ $delay -gt $MAX_DELAY ]; then
            delay=$MAX_DELAY
        fi
        
        if [ $attempt -gt 1 ]; then
            echo "  ⏳ Waiting ${delay}s before retry..."
            sleep $delay
        fi
        
        # Try to generate the client
        if (cd "$service_dir" && npx prisma generate --no-engine 2>/dev/null) || \
           (cd "$service_dir" && npx prisma generate 2>/dev/null); then
            echo "  ✅ Generated Prisma client for $service_name"
            return 0
        else
            echo "  ❌ Attempt $attempt failed for $service_name"
            if [ $attempt -eq $MAX_ATTEMPTS ]; then
                echo "  🚨 All attempts failed for $service_name"
                return 1
            fi
        fi
        
        attempt=$((attempt + 1))
    done
}

# Find all prisma schema files in services directories
echo "🔍 Scanning for Prisma schemas..."
schema_files=()
while IFS= read -r -d '' schema; do
    schema_files+=("$schema")
done < <(find services -name "schema.prisma" -print0)

if [ ${#schema_files[@]} -eq 0 ]; then
    echo "⚠️  No Prisma schemas found"
    exit 0
fi

echo "📋 Found ${#schema_files[@]} Prisma schemas"

# Generate clients for each service
failed_services=()
successful_services=()

for schema in "${schema_files[@]}"; do
    service_dir=$(dirname "$schema")
    service_name=$(basename "$(dirname "$service_dir")")
    
    if generate_service_client "$service_dir"; then
        successful_services+=("$service_name")
    else
        failed_services+=("$service_name")
    fi
done

# Summary
echo ""
echo "📊 Prisma Client Generation Summary"
echo "=================================="

if [ ${#successful_services[@]} -gt 0 ]; then
    echo -e "${GREEN}✅ Successful services (${#successful_services[@]}):${NC}"
    for service in "${successful_services[@]}"; do
        echo "  - $service"
    done
fi

if [ ${#failed_services[@]} -gt 0 ]; then
    echo -e "${RED}❌ Failed services (${#failed_services[@]}):${NC}"
    for service in "${failed_services[@]}"; do
        echo "  - $service"
    done
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
    echo "  - Check network connectivity"
    echo "  - Verify Prisma schema syntax"
    echo "  - Try running 'npx prisma generate' manually in failed service directories"
    echo "  - Check if PRISMA_ENGINES_MIRROR is accessible"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All Prisma clients generated successfully!${NC}"
exit 0
