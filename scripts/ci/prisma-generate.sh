#!/bin/bash

# Prisma Client Generation Wrapper
# Accepts either service root or prisma directory and normalizes the path
# Supports retry logic and Prisma mirror configuration

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 Prisma Client Generation Wrapper"

# Function to run prisma generate in a specific directory
run_prisma_generate() {
    local target="$1"
    local service_name=""
    
    # Normalize the path - accept either service root or prisma directory
    local srv=""
    if [ -f "$target/prisma/schema.prisma" ]; then
        srv="$target"
        service_name=$(basename "$target")
    elif [ -f "$target/schema.prisma" ]; then
        srv="$(dirname "$target")"
        service_name=$(basename "$srv")
    else
        echo -e "${RED}❌ No prisma/schema.prisma found under '$target' or its parent${NC}" >&2
        return 1
    fi
    
    echo "📦 Processing $service_name in $srv..."
    
    # Change to service directory
    cd "$srv"
    
    # Set Prisma mirror if available
    if [ -n "${PRISMA_ENGINES_MIRROR:-}" ]; then
        echo "  🌐 Using Prisma mirror: ${PRISMA_ENGINES_MIRROR}"
        export PRISMA_ENGINES_MIRROR="${PRISMA_ENGINES_MIRROR}"
    fi
    
    # Retry logic for Prisma generation
    local attempt=1
    local max_attempts=3
    local base_delay=2
    
    while [ $attempt -le $max_attempts ]; do
        echo "  🔄 Attempt $attempt/$max_attempts for $service_name..."
        
        if [ $attempt -gt 1 ]; then
            local delay=$((base_delay * (attempt - 1)))
            echo "  ⏳ Waiting ${delay}s before retry..."
            sleep $delay
        fi
        
        if npx prisma generate; then
            echo -e "${GREEN}  ✅ Generated Prisma client for $service_name${NC}"
            return 0
        else
            echo "  ❌ Attempt $attempt failed for $service_name"
            if [ $attempt -eq $max_attempts ]; then
                echo -e "${RED}  🚨 All attempts failed for $service_name${NC}"
                return 1
            fi
        fi
        
        attempt=$((attempt + 1))
    done
}

# Main execution logic
if [ $# -eq 0 ]; then
    # No arguments - find all services with Prisma schemas
    echo "🔍 Finding all services with Prisma schemas..."
    
    overall_status=0
    for schema in services/*/prisma/schema.prisma; do
        if [ -f "$schema" ]; then
            service_dir=$(dirname "$(dirname "$schema")")
            service_name=$(basename "$service_dir")
            run_prisma_generate "$service_dir" || overall_status=1
        fi
    done
    
    if [ $overall_status -eq 0 ]; then
        echo -e "${GREEN}🎉 All Prisma clients generated successfully!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some Prisma clients failed to generate${NC}"
        exit 1
    fi
else
    # Arguments provided - process specific directories
    overall_status=0
    for target_dir in "$@"; do
        if [ -d "$target_dir" ]; then
            run_prisma_generate "$target_dir" || overall_status=1
        else
            echo -e "${RED}❌ Directory $target_dir does not exist${NC}"
            overall_status=1
        fi
    done
    
    if [ $overall_status -eq 0 ]; then
        echo -e "${GREEN}🎉 All specified Prisma clients generated successfully!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some Prisma clients failed to generate${NC}"
        exit 1
    fi
fi