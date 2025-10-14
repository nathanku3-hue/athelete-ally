# PR: Remove Training Philosophy from Onboarding Flow (H0 Change)

## Summary

This PR implements a significant architectural change (H0) by removing the training-philosophy step from the onboarding flow, transitioning from a six-step to a five-step onboarding process. The change eliminates the `goal_preference` requirement and streamlines the user experience by starting onboarding at proficiency assessment.

## Changes Made

### Core Changes
- **Removed training-philosophy branch end-to-end**: Eliminated shared schemas, contracts, profile-onboarding service logic, frontend flow components, and related documentation
- **Updated onboarding flow**: Modified context, validations, UI steps, and tests to match the new five-step flow
- **Streamlined user experience**: Onboarding now starts at proficiency assessment and completes without requiring goal preference selection

### Affected Packages
- `@athlete-ally/shared-types` - Updated onboarding schemas
- `@athlete-ally/contracts` - Modified onboarding contracts
- `@athlete-ally/event-bus` - Updated event definitions
- `@athlete-ally/profile-onboarding` - Refactored service logic
- `@athlete-ally/frontend` - Updated onboarding UI flow

### Documentation
- **H0 Change Documentation**: Created `docs/streams/streamA/h0-training-philosophy-removal.md` (referenced in summary)
- **Backlog Tracking**: Recorded season-validation drift in `BACKLOG_TICKETS.md`

## Testing

### Validation Completed
- ✅ **Type-check**: All affected packages pass type checking
  - `npm run type-check -w @athlete-ally/shared-types`
  - `npm run type-check -w @athlete-ally/contracts`
  - `npm run type-check -w @athlete-ally/event-bus`
  - `npm run type-check -w @athlete-ally/profile-onboarding`
  - `npm run type-check -w @athlete-ally/frontend`

- ✅ **Linting**: All affected packages pass linting
  - `npm run lint -w @athlete-ally/shared-types`
  - `npm run lint -w @athlete-ally/contracts`
  - `npm run lint -w @athlete-ally/event-bus`
  - `npm run lint -w @athlete-ally/profile-onboarding`
  - `npm run lint -w @athlete-ally/frontend`

- ✅ **Frontend Tests**: Onboarding test suite passes
  - `npm run test:frontend -- onboarding`

## Known Issues & Pre-existing Failures

⚠️ **Important**: The following failures are **pre-existing** and **not introduced by this PR**:

### Windows-Specific Issues
- **Prisma EPERM Issues**: `npm run type-check:all` and `npm run lint:all` fail on Windows due to known Prisma file permission issues
- **Windows/Prisma Rename Problem**: File system limitations on Windows prevent proper Prisma engine operations

### Existing Technical Debt
- **Planning-Engine Lint Debt**: Pre-existing lint violations in `services/planning-engine` that are unrelated to this PR
- **CI Pipeline**: These failures are expected on Windows but should pass on Linux CI

### Impact Assessment
- **No New Violations**: This PR introduces zero new TypeScript errors or lint violations
- **Linux CI Expected**: CI should pass on Linux environments where Prisma issues don't occur
- **Scope Limited**: Failures are contained to specific packages not modified in this PR

## Verification Commands

```bash
# Individual package validation (should pass)
npm run type-check -w @athlete-ally/shared-types
npm run type-check -w @athlete-ally/contracts
npm run type-check -w @athlete-ally/event-bus
npm run type-check -w @athlete-ally/profile-onboarding
npm run type-check -w @athlete-ally/frontend

npm run lint -w @athlete-ally/shared-types
npm run lint -w @athlete-ally/contracts
npm run lint -w @athlete-ally/event-bus
npm run lint -w @athlete-ally/profile-onboarding
npm run lint -w @athlete-ally/frontend

npm run test:frontend -- onboarding
```

## Breaking Changes

- **Onboarding Flow**: Users will no longer be prompted for training philosophy/goal preference
- **API Contracts**: Onboarding endpoints no longer accept `goal_preference` parameter
- **Database Schema**: Related onboarding data structures updated (if applicable)

## Migration Notes

- **Existing Users**: Users who previously completed onboarding with training philosophy will not be affected
- **New Users**: Will experience the streamlined five-step flow
- **Backward Compatibility**: API changes are breaking but don't affect existing user data

## Related Issues

- **Season Validation Drift**: Documented in `BACKLOG_TICKETS.md` - shared schema requires `competitionDate` but frontend permits null season payloads
- **H0 Documentation**: Reference `docs/streams/streamA/h0-training-philosophy-removal.md` for detailed architectural decision record

## Review Checklist

- [ ] Verify onboarding flow works end-to-end
- [ ] Confirm no new TypeScript errors introduced
- [ ] Validate that pre-existing failures are documented
- [ ] Check that Linux CI passes (Windows failures expected)
- [ ] Review H0 documentation completeness
- [ ] Ensure backward compatibility considerations are addressed

---

**Note**: This PR represents a significant architectural change (H0) and should be reviewed carefully for impact on user experience and system behavior.
