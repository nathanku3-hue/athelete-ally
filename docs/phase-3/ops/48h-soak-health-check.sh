#!/bin/bash
#
# 48h-soak-health-check.sh - Phase B Soak Period Health Checks
#
# Run this script every 24 hours during the soak period to verify:
#   - No fallback to ATHLETE_ALLY_EVENTS
#   - DLQ rate stays at 0
#   - Consumer health (low pending, no redelivery spikes)
#   - Stream purity (100% on AA_CORE_HOT)
#   - Database flow (recent records)
#
# Usage:
#   bash docs/phase-3/ops/48h-soak-health-check.sh
#

set -e

NATS_URL="${NATS_URL:-nats://localhost:4223}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-athlete-ally-postgres}"
NORMALIZE_SERVICE_URL="${NORMALIZE_SERVICE_URL:-http://localhost:4102}"

echo "============================================================"
echo "Phase B - 48h Soak Period Health Check"
echo "============================================================"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "NATS URL: $NATS_URL"
echo "============================================================"
echo ""

# Check 1: Fallback Detection (should be 0)
echo "1. Fallback Detection"
echo "   Checking for messages on ATHLETE_ALLY_EVENTS (legacy stream)..."

LEGACY_MESSAGES=$(node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: '$NATS_URL' });
  const jsm = await nc.jetstreamManager();
  try {
    const info = await jsm.streams.info('ATHLETE_ALLY_EVENTS');
    console.log(info.state.messages);
  } catch (err) {
    console.log('0');
  }
  await nc.close();
})();
" 2>/dev/null)

AA_CORE_HOT_MESSAGES=$(node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: '$NATS_URL' });
  const jsm = await nc.jetstreamManager();
  const info = await jsm.streams.info('AA_CORE_HOT');
  console.log(info.state.messages);
  await nc.close();
})();
" 2>/dev/null)

echo "   ATHLETE_ALLY_EVENTS messages: $LEGACY_MESSAGES"
echo "   AA_CORE_HOT messages: $AA_CORE_HOT_MESSAGES"

if [ "$LEGACY_MESSAGES" -gt 55 ]; then
  echo "   ❌ FAIL: Legacy stream received new messages (fallback detected)"
  exit 1
else
  echo "   ✅ PASS: No fallback to legacy stream"
fi
echo ""

# Check 2: DLQ Stability
echo "2. DLQ Stability"
echo "   Checking DLQ message count..."

DLQ_MESSAGES=$(node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: '$NATS_URL' });
  const jsm = await nc.jetstreamManager();
  const info = await jsm.streams.info('AA_DLQ');
  console.log(info.state.messages);
  await nc.close();
})();
" 2>/dev/null)

echo "   AA_DLQ messages: $DLQ_MESSAGES"

if [ "$DLQ_MESSAGES" -gt 5 ]; then
  echo "   ⚠️  WARN: DLQ message count increased (threshold: 5)"
  echo "   Action: Investigate DLQ subjects and error patterns"
else
  echo "   ✅ PASS: DLQ stable (baseline: 1 message)"
fi
echo ""

# Check 3: Consumer Health
echo "3. Consumer Health (normalize-hrv-durable)"

node -e "
const { connect } = require('nats');
(async () => {
  const nc = await connect({ servers: '$NATS_URL' });
  const jsm = await nc.jetstreamManager();
  const info = await jsm.consumers.info('AA_CORE_HOT', 'normalize-hrv-durable');

  console.log('   Pending messages:    ', info.num_pending || 0);
  console.log('   Ack pending:         ', info.num_ack_pending || 0);
  console.log('   Num waiting:         ', info.num_waiting || 0);
  console.log('   Delivered (stream):  ', info.delivered?.stream_seq || 0);
  console.log('   Ack floor (stream):  ', info.ack_floor?.stream_seq || 0);
  console.log('   Num redelivered:     ', info.num_redelivered || 0);

  const pending = info.num_pending || 0;
  const ackPending = info.num_ack_pending || 0;
  const redelivered = info.num_redelivered || 0;

  let status = '✅ PASS';
  if (pending > 100) {
    status = '❌ FAIL: High pending messages (> 100)';
  } else if (ackPending > 50) {
    status = '⚠️  WARN: High ack pending (> 50)';
  } else if (redelivered > 10) {
    status = '⚠️  WARN: Redeliveries detected (> 10)';
  }

  console.log('   Status:', status);

  await nc.close();
})();
" 2>/dev/null

echo ""

# Check 4: Metrics - Stream Label Distribution
echo "4. Metrics - Stream Label Distribution"
echo "   Checking normalize_hrv_messages_total..."

METRICS=$(curl -s $NORMALIZE_SERVICE_URL/metrics 2>/dev/null | grep 'normalize_hrv_messages_total{' || echo "")

if [ -z "$METRICS" ]; then
  echo "   ⚠️  WARN: No metrics found (service may not be running)"
else
  echo "$METRICS" | while read -r line; do
    echo "   $line"
  done

  # Check if all success metrics are on AA_CORE_HOT
  SUCCESS_COUNT=$(echo "$METRICS" | grep 'result="success"' | grep 'stream="AA_CORE_HOT"' | grep -oP '\d+$' || echo "0")
  LEGACY_COUNT=$(echo "$METRICS" | grep 'result="success"' | grep 'stream="ATHLETE_ALLY_EVENTS"' | grep -oP '\d+$' || echo "0")

  echo ""
  echo "   Success on AA_CORE_HOT: $SUCCESS_COUNT"
  echo "   Success on ATHLETE_ALLY_EVENTS: $LEGACY_COUNT"

  if [ "$LEGACY_COUNT" -gt 0 ]; then
    echo "   ❌ FAIL: Messages processed on legacy stream"
  else
    echo "   ✅ PASS: 100% stream purity (AA_CORE_HOT)"
  fi
fi
echo ""

# Check 5: Database Flow
echo "5. Database Flow (Recent Records)"
echo "   Checking hrv_data table for recent inserts..."

RECENT_COUNT=$(docker exec $POSTGRES_CONTAINER psql -U athlete -d athlete_normalize -t -c \
  "SELECT COUNT(*) FROM hrv_data WHERE \"createdAt\" > NOW() - INTERVAL '10 minutes';" 2>/dev/null | tr -d ' ' || echo "0")

echo "   Records in last 10 minutes: $RECENT_COUNT"

if [ "$RECENT_COUNT" -eq 0 ]; then
  echo "   ⚠️  WARN: No recent database inserts (check if traffic is expected)"
else
  echo "   ✅ PASS: Database flow active"
fi
echo ""

# Check 6: DLQ Rate from Metrics
echo "6. DLQ Rate (Metrics)"
echo "   Checking normalize_hrv_messages_total{result=\"dlq\"}..."

DLQ_METRIC=$(curl -s $NORMALIZE_SERVICE_URL/metrics 2>/dev/null | grep 'normalize_hrv_messages_total{result="dlq"' || echo "")

if [ -z "$DLQ_METRIC" ]; then
  echo "   ✅ PASS: No DLQ metrics (rate = 0)"
else
  DLQ_COUNT=$(echo "$DLQ_METRIC" | grep -oP '\d+$' || echo "0")
  echo "   $DLQ_METRIC"

  if [ "$DLQ_COUNT" -gt 0 ]; then
    echo "   ⚠️  WARN: DLQ counter > 0 ($DLQ_COUNT messages)"
    echo "   Action: Check service logs for DLQ routing reasons"
  else
    echo "   ✅ PASS: DLQ rate = 0"
  fi
fi
echo ""

# Summary
echo "============================================================"
echo "Health Check Summary"
echo "============================================================"
echo "Soak Period Status: IN PROGRESS"
echo "Next Check: $(date -u -d '+24 hours' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""
echo "Key Metrics:"
echo "  - AA_CORE_HOT messages: $AA_CORE_HOT_MESSAGES"
echo "  - ATHLETE_ALLY_EVENTS messages: $LEGACY_MESSAGES (baseline: 55)"
echo "  - AA_DLQ messages: $DLQ_MESSAGES (baseline: 1)"
echo "  - Recent DB inserts (10min): $RECENT_COUNT"
echo ""
echo "✅ Health check complete"
echo "============================================================"
