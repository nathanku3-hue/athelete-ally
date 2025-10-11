# Git History Scrub Plan

## Overview
This document outlines the plan to clean large files from Git history using BFG Repo-Cleaner.

## Files to Remove
- `reports/deps/eslint-boundaries*.json` (multiple files > 1MB)
- Any other large files identified by the large-files-guard

## Prerequisites
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) installed
- Backup of the repository
- Coordination with team members

## Execution Plan

### Phase 1: Preparation (Low Traffic Window)
1. **Schedule**: Execute during low-traffic hours (e.g., weekend)
2. **Communication**: Notify all contributors 48 hours in advance
3. **Backup**: Create full repository backup
4. **Documentation**: Update team documentation

### Phase 2: Execution
```bash
# 1. Clone a fresh copy
git clone --mirror https://github.com/your-org/athlete-ally.git athlete-ally-clean.git
cd athlete-ally-clean.git

# 2. Run BFG to remove large files
java -jar bfg.jar --delete-files "eslint-boundaries*.json" athlete-ally-clean.git

# 3. Clean up and repack
cd athlete-ally-clean.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. Push cleaned repository
git push --force
```

### Phase 3: Post-Execution
1. **Verification**: Confirm large files are removed
2. **Team Notification**: Inform contributors to re-clone/fetch
3. **Documentation Update**: Update setup instructions
4. **Monitoring**: Watch for any issues

## Impact on Contributors

### Required Actions
- **Re-clone**: All contributors must re-clone the repository
- **Branch Updates**: Existing branches may need force-push
- **Local Cleanup**: Remove local copies of large files

### Communication Template
```
Subject: Repository History Cleanup - Action Required

We will be cleaning large files from the Git history on [DATE] at [TIME].

Required Actions:
1. Re-clone the repository after the cleanup
2. Remove any local copies of eslint-boundaries*.json files
3. Update your local branches if needed

Timeline:
- Cleanup: [DATE] [TIME]
- Completion: [DATE] [TIME]
- Resume work: [DATE] [TIME]

Questions? Contact [TEAM_LEAD]
```

## Rollback Plan
If issues occur:
1. Restore from backup
2. Communicate with team
3. Investigate and fix issues
4. Reschedule cleanup

## Success Criteria
- [ ] Large files removed from history
- [ ] Repository size reduced
- [ ] All contributors successfully re-cloned
- [ ] CI/CD pipelines working
- [ ] No data loss

## Future Prevention
- Keep large-files-guard in CI/pre-receive hooks
- Regular monitoring of repository size
- Clear guidelines for large file handling
