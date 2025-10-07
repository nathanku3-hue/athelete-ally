# Debug Runbook

## Overview
This runbook provides systematic debugging procedures for CI/CD failures, linting issues, and infrastructure problems in the Athlete Ally project.

## Quick Reference Checklist

### Pre-Debug Setup
- [ ] Capture environment snapshot (Node/npm versions, Git SHA)
- [ ] Enable debug logging levels (NATS, DB, ESLint)
- [ ] Prepare artifact collection directory
- [ ] Document current branch and recent changes

### CI/CD Debugging
- [ ] Analyze GitHub Actions logs for error patterns
- [ ] Check merge conflict markers (`git grep` results)
- [ ] Validate dependency lock files (`package-lock.json` presence)
- [ ] Review pre-push hook failures (`husky` + `lint-staged`)

### Linting & Code Quality
- [ ] Run ESLint with JSON output for artifact collection
- [ ] Generate type-check reports
- [ ] Execute test suite and capture results
- [ ] Document boundary violations with minimal diff summaries

### Infrastructure Debugging
- [ ] Capture NATS/JetStream stream/consumer info
- [ ] Record lag and ack/redelivery statistics
- [ ] Document exact commands used and outputs
- [ ] Include requestId/correlationId in structured logs

## Detailed Procedures

### 1. Environment Snapshot Capture

```bash
# Create debug environment report
cat > debug-env-report.txt << EOF
=== Environment Snapshot ===
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

=== Recent Commits ===
$(git log --oneline -5)
EOF
```

### 2. Linting & Code Quality Debug

```bash
# Generate comprehensive linting reports
mkdir -p debug-artifacts

# ESLint JSON report
npm run lint:ci -- . -f json > debug-artifacts/eslint-report.json

# TypeScript check
npx tsc --noEmit --pretty > debug-artifacts/typescript-check.txt 2>&1

# Test results
npm test > debug-artifacts/test-results.txt 2>&1

# Boundary violations summary
npm run lint:ci -- --rule "import/no-internal-modules: error" --rule "no-restricted-imports: error" -f compact > debug-artifacts/boundary-violations.txt
```

### 3. NATS/JetStream Debugging

```bash
# NATS stream and consumer information
cat > debug-artifacts/nats-debug.txt << EOF
=== NATS Stream Information ===
$(nats stream list --json 2>/dev/null || echo "NATS CLI not available")

=== Consumer Information ===
$(nats consumer list --json 2>/dev/null || echo "NATS CLI not available")

=== Stream Stats ===
$(nats stream info --json 2>/dev/null || echo "NATS CLI not available")

=== Consumer Stats ===
$(nats consumer info --json 2>/dev/null || echo "NATS CLI not available")
EOF

# JetStream lag and redelivery stats
nats stream list --json > debug-artifacts/stream-lag-stats.json 2>/dev/null || echo "NATS CLI not available"
nats consumer list --json > debug-artifacts/consumer-redelivery-stats.json 2>/dev/null || echo "NATS CLI not available"
```

### 4. Structured Logging Enhancement

```typescript
// Example structured logging configuration
interface DebugLogContext {
  requestId: string;
  correlationId?: string;
  subject?: string;
  durable?: string;
  redeliveryCount?: number;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
}

// Debug logging toggle
const DEBUG_CONFIG = {
  NATS_LOG_LEVEL: process.env.DEBUG_NATS ? 'debug' : 'info',
  DB_LOG_LEVEL: process.env.DEBUG_DB ? 'debug' : 'info',
  ESLINT_VERBOSE: process.env.DEBUG_ESLINT === 'true'
};
```

### 5. CI Boundary Violation Analysis

```bash
# Generate minimal diff for boundary violations
git diff --name-only HEAD~1 HEAD | grep -E '\.(ts|tsx)$' | grep -v -E '(test|spec)\.(ts|tsx)$' > debug-artifacts/changed-files.txt

# Run boundary checks with detailed output
npm run lint:ci -- --rule "import/no-internal-modules: error" --rule "no-restricted-imports: error" --format=compact $(cat debug-artifacts/changed-files.txt) > debug-artifacts/boundary-violations-detailed.txt

# Generate allowhubedit workflow note
echo "=== AllowHubEdit Workflow Note ===" > debug-artifacts/workflow-notes.txt
echo "If boundary violations are detected, check:" >> debug-artifacts/workflow-notes.txt
echo "1. Import patterns in changed files" >> debug-artifacts/workflow-notes.txt
echo "2. ESLint configuration consistency" >> debug-artifacts/workflow-notes.txt
echo "3. Monorepo layer direction compliance" >> debug-artifacts/workflow-notes.txt
```

### 6. Generator Drift Detection

```bash
# Check for generator drift
if [ -f "scripts/generate-*.ts" ]; then
  echo "=== Generator Drift Check ===" > debug-artifacts/generator-drift.txt
  npm run generate:check > debug-artifacts/generator-drift.txt 2>&1 || echo "Generator check failed"
fi

# Capture deterministic generation results
npm run generate:deterministic > debug-artifacts/deterministic-generation.txt 2>&1 || echo "Deterministic generation failed"
```

### 7. Artifact Collection & Upload

```bash
# Create debug package
tar -czf debug-run-$(date +%Y%m%d-%H%M%S).tar.gz debug-artifacts/ debug-env-report.txt

# Upload to CI artifacts (GitHub Actions)
if [ "$CI" = "true" ]; then
  echo "Uploading debug artifacts..."
  # GitHub Actions artifact upload would go here
fi
```

## Debug Run Templates

### Template 1: CI Failure Debug Run
```bash
#!/bin/bash
# CI Failure Debug Template

set -euo pipefail

echo "Starting CI failure debug run..."

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
EOF

# 2. Linting analysis
mkdir -p debug-artifacts
npm run lint:ci -- . -f json > debug-artifacts/eslint-report.json || true

# 3. Boundary violations
npm run lint:ci -- --rule "import/no-internal-modules: error" --rule "no-restricted-imports: error" -f compact > debug-artifacts/boundary-violations.txt || true

# 4. Package analysis
npm ls --depth=0 > debug-artifacts/package-tree.txt || true

echo "CI debug run completed. Check debug-artifacts/ directory."
```

### Template 2: NATS Infrastructure Debug Run
```bash
#!/bin/bash
# NATS Infrastructure Debug Template

set -euo pipefail

echo "Starting NATS infrastructure debug run..."

# 1. NATS connection test
nats server info > debug-artifacts/nats-server-info.txt 2>/dev/null || echo "NATS server unreachable"

# 2. Stream diagnostics
nats stream list --json > debug-artifacts/streams.json 2>/dev/null || echo "Stream list failed"

# 3. Consumer diagnostics
nats consumer list --json > debug-artifacts/consumers.json 2>/dev/null || echo "Consumer list failed"

# 4. Lag analysis
for stream in $(nats stream list --json | jq -r '.[].config.name' 2>/dev/null); do
  echo "=== Stream: $stream ===" >> debug-artifacts/stream-lag-analysis.txt
  nats stream info "$stream" --json >> debug-artifacts/stream-lag-analysis.txt 2>/dev/null || echo "Failed to get info for $stream"
done

echo "NATS infrastructure debug run completed."
```

## Common Debug Scenarios

### Scenario 1: ESLint Boundary Violations
**Symptoms**: CI fails with import boundary errors
**Debug Steps**:
1. Run boundary check with verbose output
2. Analyze changed files for import patterns
3. Check ESLint configuration consistency
4. Generate minimal diff for triage

### Scenario 2: NATS Connection Issues
**Symptoms**: Message processing failures, timeouts
**Debug Steps**:
1. Capture stream/consumer information
2. Check lag and redelivery statistics
3. Verify connection parameters
4. Test with structured logging enabled

### Scenario 3: Generator Drift
**Symptoms**: Generated files differ between runs
**Debug Steps**:
1. Run deterministic generation
2. Compare outputs with previous runs
3. Check environment consistency
4. Validate input parameters

## Debug Artifact Retention

- **Local Debug Runs**: Retain for 7 days
- **CI Debug Artifacts**: Retain for 30 days
- **Critical Issues**: Archive permanently with issue references

## Integration with CI/CD

### GitHub Actions Integration
```yaml
# Example GitHub Actions step for debug artifact collection
- name: Collect Debug Artifacts
  if: failure()
  run: |
    mkdir -p debug-artifacts
    ./scripts/debug-run.sh
  continue-on-error: true

- name: Upload Debug Artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: debug-artifacts-${{ github.run_id }}
    path: debug-artifacts/
    retention-days: 30
```

## Maintenance Notes

- Update debug procedures quarterly
- Review artifact retention policies annually
- Validate debug scripts with each major dependency update
- Document new error patterns as they emerge

---

*Last Updated: $(date)*
*Version: 1.0*
