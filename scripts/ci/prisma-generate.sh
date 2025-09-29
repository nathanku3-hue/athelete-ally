#!/bin/bash

# Prisma Generation Wrapper for CI
# Toggles between engine and no-engine based on PRISMA_NO_ENGINE environment variable

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔧 Prisma Client Generation Wrapper"

# Check if we should skip engine download
if [ "${PRISMA_NO_ENGINE:-}" = "1" ]; then
    echo -e "${YELLOW}📦 Generating Prisma client without engine (CI-optimized)${NC}"
    npx prisma generate --no-engine
    echo -e "${GREEN}✅ Prisma client generated successfully (no-engine mode)${NC}"
else
    echo -e "${GREEN}📦 Generating Prisma client with engine (runtime mode)${NC}"
    
    # Set Prisma mirror if available
    if [ -n "${PRISMA_ENGINES_MIRROR:-}" ]; then
        echo "🌐 Using Prisma mirror: ${PRISMA_ENGINES_MIRROR}"
        export PRISMA_ENGINES_MIRROR="${PRISMA_ENGINES_MIRROR}"
    fi
    
    # Retry logic for engine download
    attempt=1
    max_attempts=3
    base_delay=5
    
    while [ $attempt -le $max_attempts ]; do
        echo "🔄 Attempt $attempt/$max_attempts..."
        
        if [ $attempt -gt 1 ]; then
            delay=$((base_delay * (2 ** (attempt - 2))))
            echo "⏳ Waiting ${delay}s before retry..."
            sleep $delay
        fi
        
        if npx prisma generate; then
            echo -e "${GREEN}✅ Prisma client generated successfully (with engine)${NC}"
            exit 0
        else
            echo "❌ Attempt $attempt failed"
            if [ $attempt -eq $max_attempts ]; then
                echo "🚨 All attempts failed for Prisma generation"
                exit 1
            fi
        fi
        
        attempt=$((attempt + 1))
    done
fi
