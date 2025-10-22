#!/bin/bash

# Stream5 Time Crunch Mode - Grafana Dashboard Deployment Script
# Usage: ./deploy-dashboard.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
DASHBOARD_FILE="infrastructure/monitoring/grafana/dashboards/stream5-time-crunch-dashboard.json"

# Configuration based on environment
case $ENVIRONMENT in
  staging)
    GRAFANA_URL="https://staging-grafana.athlete-ally.com"
    API_KEY="${STAGING_GRAFANA_API_KEY}"
    ;;
  production)
    GRAFANA_URL="https://grafana.athlete-ally.com"
    API_KEY="${PRODUCTION_GRAFANA_API_KEY}"
    ;;
  *)
    echo "Usage: $0 [staging|production]"
    exit 1
    ;;
esac

# Validate required environment variables
if [ -z "$API_KEY" ]; then
  echo "Error: ${ENVIRONMENT^^}_GRAFANA_API_KEY environment variable not set"
  exit 1
fi

# Check if dashboard file exists
if [ ! -f "$DASHBOARD_FILE" ]; then
  echo "Error: Dashboard file not found: $DASHBOARD_FILE"
  exit 1
fi

echo "Deploying Stream5 Time Crunch Dashboard to $ENVIRONMENT..."
echo "Grafana URL: $GRAFANA_URL"

# Test Grafana connectivity
echo "Testing Grafana connectivity..."
if ! curl -s -H "Authorization: Bearer $API_KEY" "$GRAFANA_URL/api/health" > /dev/null; then
  echo "Error: Cannot connect to Grafana at $GRAFANA_URL"
  exit 1
fi

# Deploy dashboard
echo "Deploying dashboard..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @"$DASHBOARD_FILE" \
  "$GRAFANA_URL/api/dashboards/db")

# Check deployment result
if echo "$RESPONSE" | grep -q '"status":"success"'; then
  echo "✅ Dashboard deployed successfully!"
  
  # Extract dashboard URL
  DASHBOARD_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$DASHBOARD_URL" ]; then
    echo "Dashboard URL: $GRAFANA_URL$DASHBOARD_URL"
  fi
  
  # Set dashboard as favorite
  DASHBOARD_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
  if [ -n "$DASHBOARD_ID" ]; then
    echo "Setting dashboard as favorite..."
    curl -s -X POST \
      -H "Authorization: Bearer $API_KEY" \
      "$GRAFANA_URL/api/user/stars/dashboard/$DASHBOARD_ID" > /dev/null
  fi
  
else
  echo "❌ Dashboard deployment failed!"
  echo "Response: $RESPONSE"
  exit 1
fi

# Verify dashboard is accessible
echo "Verifying dashboard accessibility..."
if curl -s -H "Authorization: Bearer $API_KEY" "$GRAFANA_URL/api/dashboards/uid/stream5-time-crunch" > /dev/null; then
  echo "✅ Dashboard verification successful!"
else
  echo "⚠️  Dashboard deployed but verification failed"
fi

echo ""
echo "🎉 Stream5 Time Crunch Dashboard deployment complete!"
echo ""
echo "Next steps:"
echo "1. Enable feature flag in $ENVIRONMENT"
echo "2. Start monitoring dashboard metrics"
echo "3. Begin staging validation process"
echo ""
echo "Dashboard URL: $GRAFANA_URL/d/stream5-time-crunch"
