#!/bin/bash
# General Debug Run Template

set -euo pipefail

echo "Starting general debug run..."

# Create debug directory
mkdir -p debug-artifacts

# 1. Environment snapshot
cat > debug-env-report.txt << EOF
=== Debug Environment Snapshot ===
Date: $(date -u)
Git SHA: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)
Node Version: $(node --version)
NPM Version: $(npm --version)
OS: $(uname -a)

=== Key Environment Variables (Redacted) ===
NODE_ENV: ${NODE_ENV:-not_set}
NATS_URL: ${NATS_URL:+[REDACTED]}
DATABASE_URL: ${DATABASE_URL:+[REDACTED]}
API_BASE_URL: ${API_BASE_URL:-not_set}
CI: ${CI:-false}
GITHUB_ACTIONS: ${GITHUB_ACTIONS:-false}

=== Recent Commits ===
$(git log --oneline -5)

=== Changed Files ===
$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "No previous commit")
EOF

# 2. Comprehensive linting reports
echo "Generating linting reports..."
npm run lint:ci -- . -f json > debug-artifacts/eslint-report.json 2>/dev/null || echo "ESLint failed" > debug-artifacts/eslint-report.json

# 3. TypeScript check
echo "Running TypeScript check..."
npx tsc --noEmit --pretty > debug-artifacts/typescript-check.txt 2>&1 || echo "TypeScript check failed" >> debug-artifacts/typescript-check.txt

# 4. Test results
echo "Running test suite..."
npm test > debug-artifacts/test-results.txt 2>&1 || echo "Test suite failed" >> debug-artifacts/test-results.txt

# 5. Boundary violations summary
echo "Checking boundary violations..."
npm run lint:ci -- --rule "import/no-internal-modules: error" --rule "no-restricted-imports: error" -f compact > debug-artifacts/boundary-violations.txt 2>/dev/null || echo "Boundary check failed" > debug-artifacts/boundary-violations.txt

# 6. Generator drift check
echo "Checking for generator drift..."
if [ -f "scripts/generate-*.ts" ] || [ -f "scripts/generate-*.js" ]; then
  echo "=== Generator Drift Check ===" > debug-artifacts/generator-drift.txt
  npm run generate:check > debug-artifacts/generator-drift.txt 2>&1 || echo "Generator check failed" >> debug-artifacts/generator-drift.txt
else
  echo "No generator scripts found" > debug-artifacts/generator-drift.txt
fi

# 7. Package analysis
echo "Analyzing package dependencies..."
npm ls --depth=0 > debug-artifacts/package-tree.txt 2>/dev/null || echo "Package analysis failed" > debug-artifacts/package-tree.txt

# 8. Git status and diff
echo "Capturing git status..."
git status --porcelain > debug-artifacts/git-status.txt
git diff --stat > debug-artifacts/git-diff-stat.txt
git diff HEAD~1 HEAD --name-only > debug-artifacts/changed-files.txt 2>/dev/null || echo "No previous commit" > debug-artifacts/changed-files.txt

# 9. NATS information (if available)
echo "Collecting NATS information..."
if command -v nats >/dev/null 2>&1; then
  nats server info > debug-artifacts/nats-server-info.txt 2>/dev/null || echo "NATS server unreachable" > debug-artifacts/nats-server-info.txt
  nats stream list --json > debug-artifacts/nats-streams.json 2>/dev/null || echo "NATS stream list failed" > debug-artifacts/nats-streams.json
else
  echo "NATS CLI not available" > debug-artifacts/nats-server-info.txt
fi

# 10. Workflow notes
echo "=== AllowHubEdit Workflow Note ===" > debug-artifacts/workflow-notes.txt
echo "If boundary violations are detected, check:" >> debug-artifacts/workflow-notes.txt
echo "1. Import patterns in changed files" >> debug-artifacts/workflow-notes.txt
echo "2. ESLint configuration consistency" >> debug-artifacts/workflow-notes.txt
echo "3. Monorepo layer direction compliance" >> debug-artifacts/workflow-notes.txt
echo "4. Next.js internal module imports (should be allowed)" >> debug-artifacts/workflow-notes.txt

# 11. Create debug package
echo "Creating debug package..."
tar -czf "debug-run-$(date +%Y%m%d-%H%M%S).tar.gz" debug-artifacts/ debug-env-report.txt

echo "General debug run completed. Check debug-artifacts/ directory and debug-run-*.tar.gz file."
echo ""
echo "Debug artifacts collected:"
ls -la debug-artifacts/
echo ""
echo "Environment report: debug-env-report.txt"
echo "Debug package: debug-run-*.tar.gz"
