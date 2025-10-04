# RCA: NATS Pull Consumer Post-First-Batch Stall

## Incident Summary

**Date:** 2025-10-03
**Severity:** High
**Impact:** Sleep and HRV normalization consumers failed to process messages after the first batch despite correct code structure
**Status:** ✅ Resolved

## Problem Statement

Both Sleep and HRV pull consumers would start successfully, bind to their durable consumers, process the first batch of messages on startup, but then become completely silent - no further message processing, no errors, no logs. Messages accumulated with `num_pending > 0` but `delivered` count remained static.

## Root Cause Analysis

### The Bug

The pull consumer loop used an **unbounded async iterator pattern** without explicit termination:

```typescript
// ❌ BROKEN: Iterator doesn't terminate after first batch
while (running) {
  await sub.pull({ batch: BATCH_SIZE, expires: EXPIRES_MS });

  for await (const m of sub) {
    await handleMessage(m);
    // No break condition - iterator never exits
  }
}
```

**Why it fails:**
1. After `sub.pull()` completes, the `for await` iterator begins consuming messages
2. When the first batch is exhausted, the iterator **waits indefinitely** for more messages
3. The outer `while` loop never re-enters to issue a new `pull()` request
4. No errors are thrown - the consumer just silently stalls

### The Fix

Use a **time-bounded async iterator** with explicit break conditions:

```typescript
// ✅ CORRECT: Bounded iterator with break condition
while (running) {
  await sub.pull({ batch: BATCH_SIZE, expires: EXPIRES_MS });

  let processed = 0;
  const deadline = Date.now() + EXPIRES_MS + 100;

  for await (const m of sub) {
    await handleMessage(m);
    processed++;

    // Break when batch complete OR deadline reached
    if (processed >= BATCH_SIZE || Date.now() >= deadline) {
      break;
    }
  }

  if (processed === 0) {
    await new Promise(resolve => setTimeout(resolve, 250)); // Idle backoff
  }

  await new Promise(resolve => setTimeout(resolve, IDLE_BACKOFF_MS));
}
```

**Why this works:**
1. `sub.pull()` requests the next batch from NATS
2. Iterator consumes messages but **explicitly breaks** after batch/deadline
3. Outer loop re-enters, issues new `pull()`, and continues
4. Short idle backoff prevents tight spinning when no messages available

## Timeline of Discovery

1. **Initial state:** Sleep consumer showed `num_pending: 3`, `delivered: 3` (stuck on old messages)
2. **Code review:** Confirmed `sub.pull()` existed - looked correct at first glance
3. **Service restart:** Consumer bound successfully, processed first batch, then silence
4. **NATS inspection:** Stream had messages, consumer was healthy, but no delivery activity
5. **Root cause identified:** Async iterator without break condition caused infinite wait
6. **Solution implemented:** Added explicit break on `processed >= BATCH_SIZE || deadline`
7. **Verification:** 3 consecutive smoke tests passed, `num_pending → 0` in all runs

## Affected Components

- `services/normalize-service/src/index.ts`
  - HRV consumer loop (lines 316-355)
  - Sleep consumer loop (lines 583-622)

## Verification

**Before fix:**
- Sleep: `num_pending: 3`, processing stalled after first batch
- HRV: `num_pending: 0` (but would stall on new messages)

**After fix:**
- Sleep: 3/3 smoke tests passed, `SleepNormalizedStored` event published
- HRV: Loop pattern unified with Sleep, ready for traffic
- Service logs: Steady pull/batch/idle cycles with DEBUG enabled, quiet with DEBUG disabled

## Configuration

### Environment Variables

```bash
# Consumer tuning (per-consumer)
BATCH_SIZE=10                    # Messages per batch (default: 10)
EXPIRES_MS=750                   # Pull request timeout (default: 750ms)
IDLE_BACKOFF_MS=50              # Loop backoff when idle (default: 50ms)

# Debug logging
DEBUG_CONSUMER_LOOPS=true       # Enable debug logging for all consumers
```

### Hardcoded Defaults

```typescript
const BATCH_SIZE = 10;
const EXPIRES_MS = 5000;          // Note: Default is 5000ms in code
const IDLE_BACKOFF_MS = 50;
```

## Lessons Learned

1. **NATS Pull API Semantics:** `pull()` is a request; the async iterator yields messages, but must be explicitly terminated
2. **Silent Failures:** Incorrect async patterns can cause complete silence - no errors, no logs, just stuck state
3. **Bounded Iteration Required:** Always add explicit break conditions to async iterators in loops
4. **Debug Logging Essential:** Added debug logs for pull/batch/idle to make stalls immediately visible

## Prevention Measures

1. ✅ **Pattern documented** in this RCA for future consumer implementations
2. ✅ **Both consumers fixed** (HRV and Sleep) using identical pattern
3. ✅ **Smoke tests created** to verify `num_pending → 0` after event publish
4. ⏳ **TODO:** Add CI smoke test that asserts consumer lag clears within timeout
5. ⏳ **TODO:** Alert on consumer `num_pending > threshold` for 60+ seconds

## References

- NATS JetStream Pull Consumer Docs: https://docs.nats.io/nats-concepts/jetstream/consumers
- Pull Pattern: Issue `pull()` request, iterate messages with explicit termination
- Durable Consumer State: `delivered`, `ack_floor`, `num_pending` metrics in `/jsz` endpoint
