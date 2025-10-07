#!/bin/bash
# NATS Infrastructure Debug Template

set -euo pipefail

echo "Starting NATS infrastructure debug run..."

# Create debug directory
mkdir -p debug-artifacts

# 1. Environment snapshot
cat > debug-env-report.txt << EOF
=== NATS Debug Environment ===
Date: $(date -u)
Git SHA: $(git rev-parse HEAD)
Node Version: $(node --version)
NATS_URL: ${NATS_URL:+[REDACTED]}
NODE_ENV: ${NODE_ENV:-not_set}
EOF

# 2. NATS connection test
echo "Testing NATS connection..."
nats server info > debug-artifacts/nats-server-info.txt 2>/dev/null || echo "NATS server unreachable" > debug-artifacts/nats-server-info.txt

# 3. Stream diagnostics
echo "Collecting stream information..."
nats stream list --json > debug-artifacts/streams.json 2>/dev/null || echo "Stream list failed" > debug-artifacts/streams.json

# 4. Consumer diagnostics
echo "Collecting consumer information..."
nats consumer list --json > debug-artifacts/consumers.json 2>/dev/null || echo "Consumer list failed" > debug-artifacts/consumers.json

# 5. Lag analysis
echo "Analyzing stream lag..."
cat > debug-artifacts/stream-lag-analysis.txt << EOF
=== Stream Lag Analysis ===
Date: $(date -u)
EOF

# Extract stream names and analyze each
if command -v jq >/dev/null 2>&1; then
  for stream in $(jq -r '.[].config.name' debug-artifacts/streams.json 2>/dev/null); do
    echo "=== Stream: $stream ===" >> debug-artifacts/stream-lag-analysis.txt
    nats stream info "$stream" --json >> debug-artifacts/stream-lag-analysis.txt 2>/dev/null || echo "Failed to get info for $stream" >> debug-artifacts/stream-lag-analysis.txt
  done
else
  echo "jq not available, skipping detailed stream analysis" >> debug-artifacts/stream-lag-analysis.txt
fi

# 6. Consumer stats
echo "Collecting consumer statistics..."
cat > debug-artifacts/consumer-stats.txt << EOF
=== Consumer Statistics ===
Date: $(date -u)
EOF

if command -v jq >/dev/null 2>&1; then
  for consumer in $(jq -r '.[].name' debug-artifacts/consumers.json 2>/dev/null); do
    echo "=== Consumer: $consumer ===" >> debug-artifacts/consumer-stats.txt
    nats consumer info "$consumer" --json >> debug-artifacts/consumer-stats.txt 2>/dev/null || echo "Failed to get info for $consumer" >> debug-artifacts/consumer-stats.txt
  done
else
  echo "jq not available, skipping detailed consumer analysis" >> debug-artifacts/consumer-stats.txt
fi

# 7. JetStream account info
echo "Collecting JetStream account information..."
nats account info --json > debug-artifacts/jetstream-account.json 2>/dev/null || echo "JetStream account info failed" > debug-artifacts/jetstream-account.json

# 8. Create debug package
echo "Creating debug package..."
tar -czf "nats-debug-$(date +%Y%m%d-%H%M%S).tar.gz" debug-artifacts/ debug-env-report.txt

echo "NATS infrastructure debug run completed. Check debug-artifacts/ directory and nats-debug-*.tar.gz file."
