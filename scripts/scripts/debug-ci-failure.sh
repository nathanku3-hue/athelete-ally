#!/bin/bash
# CI Failure Debug Template

set -euo pipefail

echo "Starting CI failure debug run..."

# Create debug directory
mkdir -p debug-artifacts

# 1. Environment snapshot
cat > debug-env-report.txt << EOF
=== CI Debug Environment ===
Date: $(date -u)
Git SHA: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)
Node Version: $(node --version)
NPM Version: $(npm --version)
CI: ${CI:-false}
GITHUB_ACTIONS: ${GITHUB_ACTIONS:-false}

=== Recent Commits ===
$(git log --oneline -5)

=== Changed Files ===
$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "No previous commit")
EOF

# 2. Linting analysis
echo "Running ESLint analysis..."
npm run lint:ci -- . -f json > debug-artifacts/eslint-report.json 2>/dev/null || echo "ESLint failed" > debug-artifacts/eslint-report.json

# 3. Boundary violations
echo "Checking boundary violations..."
npm run lint:ci -- --rule "import/no-internal-modules: error" --rule "no-restricted-imports: error" -f compact > debug-artifacts/boundary-violations.txt 2>/dev/null || echo "Boundary check failed" > debug-artifacts/boundary-violations.txt

# 4. TypeScript check
echo "Running TypeScript check..."
npx tsc --noEmit --pretty > debug-artifacts/typescript-check.txt 2>&1 || echo "TypeScript check failed" >> debug-artifacts/typescript-check.txt

# 5. Package analysis
echo "Analyzing package dependencies..."
npm ls --depth=0 > debug-artifacts/package-tree.txt 2>/dev/null || echo "Package analysis failed" > debug-artifacts/package-tree.txt

# 6. Git status
echo "Capturing git status..."
git status --porcelain > debug-artifacts/git-status.txt
git diff --stat > debug-artifacts/git-diff-stat.txt

# 7. Create debug package
echo "Creating debug package..."
tar -czf "debug-run-$(date +%Y%m%d-%H%M%S).tar.gz" debug-artifacts/ debug-env-report.txt

echo "CI debug run completed. Check debug-artifacts/ directory and debug-run-*.tar.gz file."
