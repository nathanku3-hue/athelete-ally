#!/bin/bash

# Prisma Generation Wrapper for CI
# Toggles between engine and no-engine based on PRISMA_NO_ENGINE environment variable
# Supports directory arguments to run from specific service directories

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔧 Prisma Client Generation Wrapper"

# Function to run prisma generate in a specific directory
run_prisma_generate() {
    local target_dir="$1"
    local service_name="$2"
    
    echo "📦 Processing $service_name in $target_dir..."
    
    # Check if schema exists
    if [ ! -f "$target_dir/prisma/schema.prisma" ]; then
        echo -e "${RED}❌ No Prisma schema found in $target_dir/prisma/schema.prisma${NC}"
        return 1
    fi
    
    # Change to target directory
    cd "$target_dir"
    
    # Check if we should skip engine download
    if [ "${PRISMA_NO_ENGINE:-}" = "1" ]; then
        echo -e "${YELLOW}  📦 Generating Prisma client without engine (CI-optimized)${NC}"
        if npx prisma generate --no-engine; then
            echo -e "${GREEN}  ✅ Generated Prisma client for $service_name (no-engine mode)${NC}"
            return 0
        else
            echo -e "${RED}  ❌ Failed to generate Prisma client for $service_name${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}  📦 Generating Prisma client with engine (runtime mode)${NC}"
        
        # Set Prisma mirror if available
        if [ -n "${PRISMA_ENGINES_MIRROR:-}" ]; then
            echo "  🌐 Using Prisma mirror: ${PRISMA_ENGINES_MIRROR}"
            export PRISMA_ENGINES_MIRROR="${PRISMA_ENGINES_MIRROR}"
        fi
        
        # Retry logic for engine download
        local attempt=1
        local max_attempts=3
        local base_delay=5
        
        while [ $attempt -le $max_attempts ]; do
            echo "  🔄 Attempt $attempt/$max_attempts for $service_name..."
            
            if [ $attempt -gt 1 ]; then
                local delay=$((base_delay * (2 ** (attempt - 2))))
                echo "  ⏳ Waiting ${delay}s before retry..."
                sleep $delay
            fi
            
            if npx prisma generate; then
                echo -e "${GREEN}  ✅ Generated Prisma client for $service_name (with engine)${NC}"
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
    fi
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
            run_prisma_generate "$service_dir" "$service_name" || overall_status=1
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
            service_name=$(basename "$target_dir")
            run_prisma_generate "$target_dir" "$service_name" || overall_status=1
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
