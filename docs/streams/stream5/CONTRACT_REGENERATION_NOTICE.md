# Contract Regeneration Notification - Time Crunch Mode

**Date:** October 19, 2025  
**Status:** ✅ **COMPLETE**  
**Impact:** All services consuming `@athlete-ally/contracts`

## Summary

Time Crunch Mode backend implementation is now live with updated contract definitions. All downstream services need to regenerate their contract bundles to access the new `timeCrunchTargetMinutes` field.

## Changes Made

### Contract Updates
- ✅ **Added `timeCrunchTargetMinutes?: number`** to `PlanGenerationRequestedEvent` interface
- ✅ **Built and published** updated contract types in `packages/contracts/dist/`
- ✅ **Verified compatibility** with existing consumers

### New Endpoint Available
- ✅ **`/api/v1/time-crunch/preview`** endpoint implemented in planning-engine
- ✅ **Feature flag gated** with `feature.stream5_time_crunch_mode`
- ✅ **Full telemetry instrumentation** for monitoring

## Action Required

### For All Services Consuming Contracts

1. **Pull latest main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Regenerate contract bundles:**
   ```bash
   npm install
   npm run build --workspace @athlete-ally/contracts
   ```

3. **Update local codegen (if applicable):**
   ```bash
   # If your service has contract codegen
   npm run codegen
   ```

### Verification Steps

1. **Check contract types are updated:**
   ```typescript
   import { PlanGenerationRequestedEvent } from '@athlete-ally/contracts';
   
   // This should now be available
   const event: PlanGenerationRequestedEvent = {
     // ... existing fields
     timeCrunchTargetMinutes: 45  // ✅ New field available
   };
   ```

2. **Test contract consumption:**
   ```bash
   # Verify your service can import the updated types
   npm run type-check
   ```

## Services That Need Updates

### High Priority (Direct Contract Consumers)
- ✅ **planning-engine** - Already updated (source of changes)
- 🔄 **gateway-bff** - Needs contract regeneration
- 🔄 **coach-tip-service** - Needs contract regeneration
- 🔄 **frontend** - Needs contract regeneration

### Medium Priority (Event Processors)
- 🔄 **notification-service** - May consume plan generation events
- 🔄 **analytics-service** - May track plan generation metrics
- 🔄 **audit-service** - May log plan generation events

### Low Priority (Indirect Consumers)
- 🔄 **Any service** that processes `PlanGenerationRequestedEvent`

## Timeline

- **Immediate:** Contract regeneration for all services
- **Within 24h:** Verification that all services can consume new field
- **Within 48h:** Feature flag rollout begins (staging → production)

## Support

If you encounter issues:

1. **Contract regeneration fails:** Check for TypeScript compilation errors
2. **Type errors:** Ensure you're importing from the built contracts (`@athlete-ally/contracts/dist`)
3. **Missing field:** Verify you've pulled the latest main branch

**Contact:** Stream5 team or create issue with `stream5` label

## Feature Flag Status

- **Local Development:** Enable with `FEATURE_STREAM5_TIME_CRUNCH_MODE=true`
- **Staging:** Pending dashboard verification
- **Production:** Planned gradual rollout (10% → 25% → 50% → 100%)

---

**Next Update:** Will be sent when feature flag rollout begins in staging environment.
