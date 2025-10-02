#!/usr/bin/env bash
# 48h Soak Health Check Script for HRV + Sleep Normalization
# Phase 3 - Production Readiness Validation
#
# Usage:
#   ./48h-soak-health-check.sh [OPTIONS]
#
# Options:
#   --json                 Output JSON summary to ./soak_sleep_summary.json
#   --checkpoint <value>   Checkpoint identifier (e.g., 24h, 48h)
#   --stream <name>        Override stream name (default: AA_CORE_HOT)
#   --durable-sleep <name> Override Sleep consumer name (default: normalize-sleep-durable)
#   --durable-hrv <name>   Override HRV consumer name (default: normalize-hrv-durable)
#
# Environment Variables:
#   NATS_URL          - NATS server URL (default: nats://localhost:4223)
#   NATS_HTTP         - NATS monitoring HTTP endpoint (default: http://localhost:8222)
#   NORMALIZE_URL     - Normalize service metrics URL (default: http://localhost:4102)
#   DATABASE_URL      - PostgreSQL connection string
#   STATE_DIR         - State directory for delta calculations (default: ~/.aa_soak_state)
#
# Note: On Windows, run dos2unix on this file if you encounter CRLF issues

set -euo pipefail

# Configuration
NATS_URL="${NATS_URL:-nats://localhost:4223}"
NATS_HTTP="${NATS_HTTP:-http://localhost:8222}"
NORMALIZE_URL="${NORMALIZE_URL:-http://localhost:4102}"
DATABASE_URL="${DATABASE_URL:-}"
STATE_DIR="${STATE_DIR:-$HOME/.aa_soak_state}"
STREAM_NAME="AA_CORE_HOT"
SLEEP_CONSUMER="normalize-sleep-durable"
HRV_CONSUMER="normalize-hrv-durable"
CHECKPOINT=""
JSON_OUTPUT=false
JSON_FILE="./soak_sleep_summary.json"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --checkpoint)
      CHECKPOINT="$2"
      shift 2
      ;;
    --stream)
      STREAM_NAME="$2"
      shift 2
      ;;
    --durable-sleep)
      SLEEP_CONSUMER="$2"
      shift 2
      ;;
    --durable-hrv)
      HRV_CONSUMER="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Colors for output (disabled in JSON mode)
if [[ "$JSON_OUTPUT" == "false" ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# Tool availability checks
HAS_CURL=$(command -v curl &> /dev/null && echo "true" || echo "false")
HAS_JQ=$(command -v jq &> /dev/null && echo "true" || echo "false")
HAS_NATS=$(command -v nats &> /dev/null && echo "true" || echo "false")
HAS_PSQL=$(command -v psql &> /dev/null && echo "true" || echo "false")
HAS_BC=$(command -v bc &> /dev/null && echo "true" || echo "false")

# Create state directory
mkdir -p "$STATE_DIR"

# Global variables for JSON output
declare -A JSON_DATA
JSON_DATA[timestamp]=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
JSON_DATA[checkpoint]="$CHECKPOINT"
JSON_DATA[nats_url]="$NATS_URL"
JSON_DATA[normalize_url]="$NORMALIZE_URL"
JSON_DATA[stream]="$STREAM_NAME"

# ============================================================================
# Utility Functions
# ============================================================================

log_pass() {
  echo -e "${GREEN}✅ PASS${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠️  WARN${NC} $1"
}

log_fail() {
  echo -e "${RED}❌ FAIL${NC} $1"
}

log_info() {
  echo -e "${BLUE}ℹ️  INFO${NC} $1"
}

log_skip() {
  echo -e "${YELLOW}⏭️  SKIP${NC} $1"
}

# ============================================================================
# NATS JetStream Functions
# ============================================================================

get_consumer_info() {
  local stream=$1
  local consumer=$2

  if [[ "$HAS_CURL" == "false" || "$HAS_JQ" == "false" ]]; then
    echo "SKIP"
    return 1
  fi

  local response
  response=$(curl -s "${NATS_HTTP}/jsz?streams=1&consumers=1" 2>/dev/null || echo "{}")

  if [[ -z "$response" || "$response" == "{}" ]]; then
    echo "ERROR"
    return 1
  fi

  echo "$response" | jq -r --arg stream "$stream" --arg consumer "$consumer" '
    .streams[]? | select(.name == $stream) |
    .consumer_detail[]? | select(.name == $consumer)
  ' 2>/dev/null || echo "NOT_FOUND"
}

get_consumer_pending() {
  local stream=$1
  local consumer=$2

  local info
  info=$(get_consumer_info "$stream" "$consumer")

  if [[ "$info" == "SKIP" || "$info" == "ERROR" || "$info" == "NOT_FOUND" ]]; then
    echo "$info"
    return 1
  fi

  echo "$info" | jq -r '.num_pending // 0' 2>/dev/null || echo "0"
}

get_stream_purity() {
  local metric_name=$1
  local metrics_data=$2

  # Check if metrics contain only expected stream
  local streams
  streams=$(echo "$metrics_data" | grep "^${metric_name}{" | grep -o 'stream="[^"]*"' | cut -d'"' -f2 | sort -u)

  if [[ -z "$streams" ]]; then
    echo "NO_DATA"
    return 1
  fi

  if [[ "$streams" == "$STREAM_NAME" ]]; then
    echo "PASS"
    return 0
  else
    echo "FAIL: Found streams: $streams"
    return 1
  fi
}

# ============================================================================
# Prometheus Metrics Functions
# ============================================================================

fetch_metrics() {
  local url=$1

  if [[ "$HAS_CURL" == "false" ]]; then
    echo "SKIP"
    return 1
  fi

  curl -s "${url}/metrics" 2>/dev/null || echo "ERROR"
}

parse_metric_total() {
  local metrics_data=$1
  local metric_name=$2
  local label_filter=$3

  echo "$metrics_data" | grep "^${metric_name}{" | grep "$label_filter" | awk '{print $2}' | awk '{s+=$1} END {print s}' || echo "0"
}

calculate_success_rate() {
  local success=$1
  local dlq=$2
  local retry=$3

  local total=$((success + dlq + retry))

  if [[ $total -eq 0 ]]; then
    echo "100.00"
    return 0
  fi

  if [[ "$HAS_BC" == "true" ]]; then
    echo "scale=2; ($success / $total) * 100" | bc -l 2>/dev/null || echo "0.00"
  else
    # Fallback without bc
    echo "$((success * 10000 / total))" | awk '{printf "%.2f", $1/100}'
  fi
}

# ============================================================================
# Database Functions
# ============================================================================

check_database_table() {
  local table=$1
  local feature=$2

  if [[ "$HAS_PSQL" == "false" || -z "$DATABASE_URL" ]]; then
    log_skip "Database check for $table (psql or DATABASE_URL not available)"
    JSON_DATA[${feature}_db_status]="SKIP"
    JSON_DATA[${feature}_db_count]=0
    return 0
  fi

  local count
  count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table WHERE created_at > NOW() - INTERVAL '1 hour';" 2>/dev/null | xargs || echo "ERROR")

  if [[ "$count" == "ERROR" ]]; then
    log_warn "Database query failed for $table"
    JSON_DATA[${feature}_db_status]="ERROR"
    JSON_DATA[${feature}_db_count]=0
    return 1
  fi

  JSON_DATA[${feature}_db_count]=$count

  if [[ $count -gt 0 ]]; then
    log_pass "$table: $count rows in last hour"
    JSON_DATA[${feature}_db_status]="PASS"
  else
    log_warn "$table: 0 rows in last hour"
    JSON_DATA[${feature}_db_status]="WARN"
  fi
}

# ============================================================================
# DLQ Depth Check
# ============================================================================

check_dlq_depth() {
  local subject_prefix=$1
  local feature=$2

  if [[ "$HAS_NATS" == "false" ]]; then
    log_skip "DLQ depth check (NATS CLI not available)"
    JSON_DATA[${feature}_dlq_status]="SKIP"
    JSON_DATA[${feature}_dlq_count]=0
    return 0
  fi

  # Try to get DLQ stream info
  local dlq_info
  dlq_info=$(nats stream info AA_DLQ --json 2>/dev/null || echo "{}")

  if [[ "$dlq_info" == "{}" ]]; then
    log_info "DLQ stream not found or not accessible"
    JSON_DATA[${feature}_dlq_status]="INFO"
    JSON_DATA[${feature}_dlq_count]=0
    return 0
  fi

  # Count messages in DLQ with subject prefix
  local dlq_count
  dlq_count=$(echo "$dlq_info" | jq -r '.state.messages // 0' 2>/dev/null || echo "0")

  JSON_DATA[${feature}_dlq_count]=$dlq_count

  if [[ $dlq_count -eq 0 ]]; then
    log_pass "DLQ depth for ${subject_prefix}: 0"
    JSON_DATA[${feature}_dlq_status]="PASS"
  else
    log_warn "DLQ depth for ${subject_prefix}: $dlq_count"
    JSON_DATA[${feature}_dlq_status]="WARN"
  fi
}

# ============================================================================
# HRV Health Checks
# ============================================================================

check_hrv_consumer() {
  echo ""
  echo "=== HRV Consumer Health ==="

  local pending
  pending=$(get_consumer_pending "$STREAM_NAME" "$HRV_CONSUMER")

  JSON_DATA[hrv_consumer_pending]="$pending"

  if [[ "$pending" == "SKIP" ]]; then
    log_skip "HRV consumer check (curl/jq not available)"
    JSON_DATA[hrv_consumer_status]="SKIP"
  elif [[ "$pending" == "ERROR" ]]; then
    log_warn "HRV consumer: Cannot fetch NATS stats"
    JSON_DATA[hrv_consumer_status]="ERROR"
  elif [[ "$pending" == "NOT_FOUND" ]]; then
    log_warn "HRV consumer: $HRV_CONSUMER not found"
    JSON_DATA[hrv_consumer_status]="NOT_FOUND"
  elif [[ $pending -lt 10 ]]; then
    log_pass "HRV consumer pending: $pending (< 10)"
    JSON_DATA[hrv_consumer_status]="PASS"
  else
    log_warn "HRV consumer pending: $pending (≥ 10)"
    JSON_DATA[hrv_consumer_status]="WARN"
  fi
}

check_hrv_metrics() {
  echo ""
  echo "=== HRV Metrics ==="

  local metrics
  metrics=$(fetch_metrics "$NORMALIZE_URL")

  if [[ "$metrics" == "SKIP" ]]; then
    log_skip "HRV metrics (curl not available)"
    JSON_DATA[hrv_metrics_status]="SKIP"
    JSON_DATA[hrv_success]=0
    JSON_DATA[hrv_dlq]=0
    JSON_DATA[hrv_retry]=0
    JSON_DATA[hrv_success_rate]="0.00"
    JSON_DATA[hrv_stream_purity]="SKIP"
    return 0
  elif [[ "$metrics" == "ERROR" ]]; then
    log_warn "HRV metrics: Cannot fetch from ${NORMALIZE_URL}/metrics"
    JSON_DATA[hrv_metrics_status]="ERROR"
    JSON_DATA[hrv_success]=0
    JSON_DATA[hrv_dlq]=0
    JSON_DATA[hrv_retry]=0
    JSON_DATA[hrv_success_rate]="0.00"
    JSON_DATA[hrv_stream_purity]="ERROR"
    return 0
  fi

  # Parse success/dlq/retry counts
  local success
  local dlq
  local retry
  success=$(parse_metric_total "$metrics" "normalize_hrv_messages_total" 'status="success"')
  dlq=$(parse_metric_total "$metrics" "normalize_hrv_messages_total" 'status="dlq"')
  retry=$(parse_metric_total "$metrics" "normalize_hrv_messages_total" 'status="retry"')

  JSON_DATA[hrv_success]=$success
  JSON_DATA[hrv_dlq]=$dlq
  JSON_DATA[hrv_retry]=$retry

  log_info "HRV success: $success, DLQ: $dlq, retry: $retry"

  # Calculate success rate
  local success_rate
  success_rate=$(calculate_success_rate "$success" "$dlq" "$retry")
  JSON_DATA[hrv_success_rate]=$success_rate

  if (( $(echo "$success_rate >= 99.9" | bc -l 2>/dev/null || echo "0") )); then
    log_pass "HRV success rate: ${success_rate}% (≥ 99.9%)"
    JSON_DATA[hrv_metrics_status]="PASS"
  else
    log_warn "HRV success rate: ${success_rate}% (< 99.9%)"
    JSON_DATA[hrv_metrics_status]="WARN"
  fi

  # Check stream purity
  local purity
  purity=$(get_stream_purity "normalize_hrv_messages_total" "$metrics")
  JSON_DATA[hrv_stream_purity]="$purity"

  if [[ "$purity" == "PASS" ]]; then
    log_pass "HRV stream purity: 100% $STREAM_NAME"
  elif [[ "$purity" == "NO_DATA" ]]; then
    log_skip "HRV stream purity (no data)"
  else
    log_fail "HRV stream purity: $purity"
  fi
}

check_hrv_database() {
  echo ""
  echo "=== HRV Database ==="
  check_database_table "hrv_data" "hrv"
}

# ============================================================================
# Sleep Health Checks
# ============================================================================

check_sleep_consumer() {
  echo ""
  echo "=== Sleep Consumer Health ==="

  local pending
  pending=$(get_consumer_pending "$STREAM_NAME" "$SLEEP_CONSUMER")

  JSON_DATA[sleep_consumer_pending]="$pending"

  if [[ "$pending" == "SKIP" ]]; then
    log_skip "Sleep consumer check (curl/jq not available)"
    JSON_DATA[sleep_consumer_status]="SKIP"
  elif [[ "$pending" == "ERROR" ]]; then
    log_warn "Sleep consumer: Cannot fetch NATS stats"
    JSON_DATA[sleep_consumer_status]="ERROR"
  elif [[ "$pending" == "NOT_FOUND" ]]; then
    log_warn "Sleep consumer: $SLEEP_CONSUMER not found"
    JSON_DATA[sleep_consumer_status]="NOT_FOUND"
  elif [[ $pending -lt 10 ]]; then
    log_pass "Sleep consumer pending: $pending (< 10)"
    JSON_DATA[sleep_consumer_status]="PASS"
  else
    log_warn "Sleep consumer pending: $pending (≥ 10)"
    JSON_DATA[sleep_consumer_status]="WARN"
  fi
}

check_sleep_metrics() {
  echo ""
  echo "=== Sleep Metrics ==="

  local metrics
  metrics=$(fetch_metrics "$NORMALIZE_URL")

  if [[ "$metrics" == "SKIP" ]]; then
    log_skip "Sleep metrics (curl not available)"
    JSON_DATA[sleep_metrics_status]="SKIP"
    JSON_DATA[sleep_success]=0
    JSON_DATA[sleep_dlq]=0
    JSON_DATA[sleep_retry]=0
    JSON_DATA[sleep_success_rate]="0.00"
    JSON_DATA[sleep_stream_purity]="SKIP"
    return 0
  elif [[ "$metrics" == "ERROR" ]]; then
    log_warn "Sleep metrics: Cannot fetch from ${NORMALIZE_URL}/metrics"
    JSON_DATA[sleep_metrics_status]="ERROR"
    JSON_DATA[sleep_success]=0
    JSON_DATA[sleep_dlq]=0
    JSON_DATA[sleep_retry]=0
    JSON_DATA[sleep_success_rate]="0.00"
    JSON_DATA[sleep_stream_purity]="ERROR"
    return 0
  fi

  # Parse success/dlq/retry counts
  local success
  local dlq
  local retry
  success=$(parse_metric_total "$metrics" "normalize_sleep_messages_total" 'status="success"')
  dlq=$(parse_metric_total "$metrics" "normalize_sleep_messages_total" 'status="dlq"')
  retry=$(parse_metric_total "$metrics" "normalize_sleep_messages_total" 'status="retry"')

  JSON_DATA[sleep_success]=$success
  JSON_DATA[sleep_dlq]=$dlq
  JSON_DATA[sleep_retry]=$retry

  log_info "Sleep success: $success, DLQ: $dlq, retry: $retry"

  # Calculate success rate
  local success_rate
  success_rate=$(calculate_success_rate "$success" "$dlq" "$retry")
  JSON_DATA[sleep_success_rate]=$success_rate

  if (( $(echo "$success_rate >= 99.9" | bc -l 2>/dev/null || echo "0") )); then
    log_pass "Sleep success rate: ${success_rate}% (≥ 99.9%)"
    JSON_DATA[sleep_metrics_status]="PASS"
  else
    log_warn "Sleep success rate: ${success_rate}% (< 99.9%)"
    JSON_DATA[sleep_metrics_status]="WARN"
  fi

  # Check stream purity
  local purity
  purity=$(get_stream_purity "normalize_sleep_messages_total" "$metrics")
  JSON_DATA[sleep_stream_purity]="$purity"

  if [[ "$purity" == "PASS" ]]; then
    log_pass "Sleep stream purity: 100% $STREAM_NAME"
  elif [[ "$purity" == "NO_DATA" ]]; then
    log_skip "Sleep stream purity (no data)"
  else
    log_fail "Sleep stream purity: $purity"
  fi
}

check_sleep_database() {
  echo ""
  echo "=== Sleep Database ==="
  check_database_table "sleep_data" "sleep"
}

check_sleep_dlq() {
  echo ""
  echo "=== Sleep DLQ ==="
  check_dlq_depth "dlq.normalize.sleep" "sleep"
}

# ============================================================================
# Soak Checklist Functions
# ============================================================================

print_hrv_checklist() {
  echo ""
  echo "=========================================="
  echo "  HRV Soak Checklist"
  echo "=========================================="
  echo "Target: Success Rate ≥ 99.9%"
  echo "Target: Consumer Pending < 10"
  echo "Target: DLQ Rate = 0"
  echo "Target: Stream Purity = 100% $STREAM_NAME"
  echo "Target: Fallback Events = 0 (TODO: not yet tracked)"
  echo "=========================================="
}

print_sleep_checklist() {
  echo ""
  echo "=========================================="
  echo "  Sleep Soak Checklist"
  echo "=========================================="
  echo "Target: Success Rate ≥ 99.9%"
  echo "Target: Consumer Pending < 10"
  echo "Target: DLQ Rate = 0"
  echo "Target: Stream Purity = 100% $STREAM_NAME"
  echo "Target: Fallback Events = 0 (TODO: not yet tracked)"
  echo "=========================================="
}

# ============================================================================
# JSON Output Function
# ============================================================================

write_json_output() {
  if [[ "$JSON_OUTPUT" == "false" ]]; then
    return 0
  fi

  if [[ "$HAS_JQ" == "false" ]]; then
    echo "Warning: jq not available, skipping JSON output"
    return 1
  fi

  # Build JSON structure
  local json_content
  json_content=$(jq -n \
    --arg ts "${JSON_DATA[timestamp]}" \
    --arg cp "${JSON_DATA[checkpoint]}" \
    --arg nats "${JSON_DATA[nats_url]}" \
    --arg norm "${JSON_DATA[normalize_url]}" \
    --arg stream "${JSON_DATA[stream]}" \
    --arg hrv_cons_status "${JSON_DATA[hrv_consumer_status]:-UNKNOWN}" \
    --arg hrv_cons_pending "${JSON_DATA[hrv_consumer_pending]:-0}" \
    --arg hrv_met_status "${JSON_DATA[hrv_metrics_status]:-UNKNOWN}" \
    --arg hrv_success "${JSON_DATA[hrv_success]:-0}" \
    --arg hrv_dlq "${JSON_DATA[hrv_dlq]:-0}" \
    --arg hrv_retry "${JSON_DATA[hrv_retry]:-0}" \
    --arg hrv_rate "${JSON_DATA[hrv_success_rate]:-0.00}" \
    --arg hrv_purity "${JSON_DATA[hrv_stream_purity]:-UNKNOWN}" \
    --arg hrv_db_status "${JSON_DATA[hrv_db_status]:-UNKNOWN}" \
    --arg hrv_db_count "${JSON_DATA[hrv_db_count]:-0}" \
    --arg sleep_cons_status "${JSON_DATA[sleep_consumer_status]:-UNKNOWN}" \
    --arg sleep_cons_pending "${JSON_DATA[sleep_consumer_pending]:-0}" \
    --arg sleep_met_status "${JSON_DATA[sleep_metrics_status]:-UNKNOWN}" \
    --arg sleep_success "${JSON_DATA[sleep_success]:-0}" \
    --arg sleep_dlq "${JSON_DATA[sleep_dlq]:-0}" \
    --arg sleep_retry "${JSON_DATA[sleep_retry]:-0}" \
    --arg sleep_rate "${JSON_DATA[sleep_success_rate]:-0.00}" \
    --arg sleep_purity "${JSON_DATA[sleep_stream_purity]:-UNKNOWN}" \
    --arg sleep_db_status "${JSON_DATA[sleep_db_status]:-UNKNOWN}" \
    --arg sleep_db_count "${JSON_DATA[sleep_db_count]:-0}" \
    --arg sleep_dlq_status "${JSON_DATA[sleep_dlq_status]:-UNKNOWN}" \
    --arg sleep_dlq_count "${JSON_DATA[sleep_dlq_count]:-0}" \
    '{
      timestamp: $ts,
      checkpoint: $cp,
      environment: {
        nats_url: $nats,
        normalize_url: $norm,
        stream: $stream
      },
      hrv: {
        consumer: {
          status: $hrv_cons_status,
          pending: $hrv_cons_pending
        },
        metrics: {
          status: $hrv_met_status,
          success: ($hrv_success | tonumber),
          dlq: ($hrv_dlq | tonumber),
          retry: ($hrv_retry | tonumber),
          success_rate: ($hrv_rate | tonumber)
        },
        stream_purity: $hrv_purity,
        database: {
          status: $hrv_db_status,
          count: ($hrv_db_count | tonumber)
        }
      },
      sleep: {
        consumer: {
          status: $sleep_cons_status,
          pending: $sleep_cons_pending
        },
        metrics: {
          status: $sleep_met_status,
          success: ($sleep_success | tonumber),
          dlq: ($sleep_dlq | tonumber),
          retry: ($sleep_retry | tonumber),
          success_rate: ($sleep_rate | tonumber)
        },
        stream_purity: $sleep_purity,
        database: {
          status: $sleep_db_status,
          count: ($sleep_db_count | tonumber)
        },
        dlq: {
          status: $sleep_dlq_status,
          count: ($sleep_dlq_count | tonumber)
        }
      }
    }')

  echo "$json_content" > "$JSON_FILE"
  log_info "JSON summary written to $JSON_FILE"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  echo "=========================================="
  echo "  48h Soak Health Check"
  echo "  Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  if [[ -n "$CHECKPOINT" ]]; then
    echo "  Checkpoint: $CHECKPOINT"
  fi
  echo "=========================================="
  echo ""
  echo "Configuration:"
  echo "  NATS_URL: $NATS_URL"
  echo "  NATS_HTTP: $NATS_HTTP"
  echo "  NORMALIZE_URL: $NORMALIZE_URL"
  echo "  DATABASE_URL: ${DATABASE_URL:-(not set)}"
  echo "  STREAM: $STREAM_NAME"
  echo "  HRV Consumer: $HRV_CONSUMER"
  echo "  Sleep Consumer: $SLEEP_CONSUMER"
  echo "  STATE_DIR: $STATE_DIR"
  echo ""
  echo "Tool Availability:"
  echo "  curl: $HAS_CURL"
  echo "  jq: $HAS_JQ"
  echo "  nats: $HAS_NATS"
  echo "  psql: $HAS_PSQL"
  echo "  bc: $HAS_BC"
  echo ""

  # HRV Checks
  print_hrv_checklist
  check_hrv_consumer
  check_hrv_metrics
  check_hrv_database

  # Sleep Checks
  print_sleep_checklist
  check_sleep_consumer
  check_sleep_metrics
  check_sleep_database
  check_sleep_dlq

  echo ""
  echo "=========================================="
  echo "  Health Check Complete"
  echo "  Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo "=========================================="

  # Write JSON output if requested
  write_json_output

  # TODO: Add delta calculation by storing state in $STATE_DIR
  #       Compare current metrics with previous checkpoint to calculate rates
  # TODO: Add fallback event detection (requires additional metrics from normalize-service)
  #       Track events that fell back from AA_CORE_HOT to ATHLETE_ALLY_EVENTS
}

main "$@"
