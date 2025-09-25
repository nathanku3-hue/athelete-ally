#!/bin/bash
# Cache dependency path diagnostic script
# Helps diagnose cache misses by showing sanitized cache-dependency-path values

set -euo pipefail

echo "🔍 Cache Dependency Path Diagnostic"
echo "=================================="

# Check if we're in a GitHub Actions environment
if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "📍 Running in GitHub Actions"
    echo "   Workflow: ${GITHUB_WORKFLOW:-unknown}"
    echo "   Job: ${GITHUB_JOB:-unknown}"
    echo "   Ref: ${GITHUB_REF:-unknown}"
else
    echo "📍 Running locally"
fi

echo ""
echo "📦 Package Lock Files Found:"
if [ -f "package-lock.json" ]; then
    echo "   ✅ Root package-lock.json ($(wc -c < package-lock.json) bytes)"
else
    echo "   ❌ No root package-lock.json"
fi

# Find all package-lock.json files
LOCKFILES=$(find . -name "package-lock.json" -not -path "./node_modules/*" 2>/dev/null || true)
if [ -n "$LOCKFILES" ]; then
    echo "   📁 Additional lockfiles:"
    echo "$LOCKFILES" | while read -r file; do
        if [ "$file" != "./package-lock.json" ]; then
            echo "      - $file ($(wc -c < "$file") bytes)"
        fi
    done
else
    echo "   📁 No additional lockfiles found"
fi

echo ""
echo "🔧 Cache Configuration:"
if [ -n "${CACHE_DEPENDENCY_PATH:-}" ]; then
    echo "   CACHE_DEPENDENCY_PATH: $CACHE_DEPENDENCY_PATH"
else
    echo "   CACHE_DEPENDENCY_PATH: (not set)"
fi

if [ -n "${NEEDS_SANITY_OUTPUTS_CACHE_DEPENDENCY_PATH:-}" ]; then
    echo "   SANITY_OUTPUT: $NEEDS_SANITY_OUTPUTS_CACHE_DEPENDENCY_PATH"
else
    echo "   SANITY_OUTPUT: (not set)"
fi

echo ""
echo "📊 Cache Status:"
if command -v npm >/dev/null 2>&1; then
    echo "   npm version: $(npm --version)"
    echo "   npm cache location: $(npm config get cache)"
    echo "   npm cache size: $(du -sh "$(npm config get cache)" 2>/dev/null || echo "unknown")"
else
    echo "   npm: not available"
fi

echo ""
echo "✅ Diagnostic complete"
