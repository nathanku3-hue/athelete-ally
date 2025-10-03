#!/usr/bin/env bash
set -euo pipefail
RULES="${1:-monitoring/alert_rules.yml}"
if command -v promtool >/dev/null 2>&1; then
  promtool check rules "$RULES"
else
  echo 'promtool not found; skipping rules validation. (Install Prometheus to enable)'
fi