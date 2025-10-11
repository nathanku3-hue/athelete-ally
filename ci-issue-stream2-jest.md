## Issue Summary

**Priority:** P1 (Critical - Deadline: 2025-10-17)
**File:** `.github/workflows/stream2-logs-tests.yml` (Line 40)
**Current Status:** `continue-on-error: true` with TODO comment

## Problem Description

The Stream 2 Jest project is failing in CI due to Jest installation issues:
- Jest marked as "peer": true in lockfile
- Bin symlink not created during npm ci
- npm ci fails, causing CI to fail

## Current Configuration

```yaml
- name: Run Stream 2 Jest project
  # TEMPORARY: Non-blocking for Stream 2 PR due to CI jest installation issue
  # Issue: Jest marked "peer": true in lockfile; bin symlink not created; npm ci fails
  # Target revert date: 2025-10-17
  # TODO: Remove continue-on-error once jest CI installation is fixed
  continue-on-error: true
```

## Revert Plan

1. **Fix Jest Installation:**
   - Investigate why Jest is marked as peer dependency
   - Fix package.json configuration
   - Ensure bin symlinks are created properly
   - Test npm ci locally and in CI

2. **Remove Exception:**
   - Remove `continue-on-error: true` from stream2-logs-tests.yml
   - Remove TODO comment
   - Verify CI passes without exception

3. **Verification:**
   - Run full CI pipeline
   - Confirm Jest tests execute successfully
   - Monitor for any regressions

## Acceptance Criteria

- [ ] Jest installation works correctly in CI
- [ ] `continue-on-error: true` removed from stream2-logs-tests.yml
- [ ] TODO comment removed
- [ ] CI pipeline passes without exceptions
- [ ] Jest tests execute successfully

## Deadline

**2025-10-17** - This is a hard deadline for CI exception cleanup.

## Related

- Phase 3 Wrap-Up: CI Exceptions Audit
- Repository: athlete-ally-original
- Branch: main
