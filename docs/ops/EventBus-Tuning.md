# Event Bus Tuning & Resilience

## Streams and Subjects
- Stream: ATHLETE_ALL_EVENTS (current: ATHLETE_ALLY_EVENTS)
- Subjects: athlete-ally.*

## Subscriptions
- Pull consumers with small batches (10) and short expires to reduce lock contention.
- Use durable names per consumer group (already in code) to resume after restarts.

## Backpressure & Retries
- Consider exponential backoff on nak() retries to avoid hot loops.
- Track dead-letter metrics and add a DLQ subject for permanently failed events.

## Schema Validation
- Continue using contracts schema as single source of truth.
- On schema failure, include truncated payload and correlation id in logs.

## Metrics
- Ensure Prometheus counters/histograms cover publish/consume success/error and durations.
- Add gauges for queue depth (via JSM) and consumer lag if needed.

## Operational Runbook
- How to purge a stuck consumer.
- How to replay from a sequence.
- How to increase retention (max_msgs / max_age) during heavy testing.
