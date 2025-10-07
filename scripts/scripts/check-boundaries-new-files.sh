#!/bin/bash
# Check boundaries for new/modified files only
# Uses unified ESLint config for consistency

set -euo pipefail

echo "🔍 Checking boundaries for new/modified files..."

# Get list of changed TypeScript/TSX files
CHANGED_FILES=$(git diff --name-only --diff-filter=AM HEAD~1 HEAD | grep -E '\.(ts|tsx)$' || true)

if [ -z "$CHANGED_FILES" ]; then
  echo "✅ No TypeScript files changed, skipping boundary check"
  exit 0
fi

echo "📁 Changed TypeScript files:"
echo "$CHANGED_FILES"

# Run ESLint with unified config on changed files only
echo "🚨 Running boundary checks on changed files..."
npx eslint $CHANGED_FILES \
  --config eslint.config.unified.mjs \
  --format=compact

echo "✅ Boundary checks passed for new/modified files"
