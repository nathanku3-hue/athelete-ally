#!/bin/bash
# Check boundaries for new/modified files only
# Used in CI to apply stricter rules to changed files

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

# Run ESLint with error-level boundary rules on changed files only
echo "🚨 Running strict boundary checks on changed files..."
npx eslint $CHANGED_FILES \
  --rule "import/no-internal-modules: error" \
  --rule "no-restricted-imports: error" \
  --format=compact

echo "✅ Boundary checks passed for new/modified files"
