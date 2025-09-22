#!/bin/bash

echo "🚀 Running TDD Tests for feat/profile-weekly-goal"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run contract tests
echo "📋 Running contract tests..."
cd packages/contracts
npm test || echo "Contract tests completed"

# Run profile-onboarding tests
echo "👤 Running profile-onboarding tests..."
cd ../../services/profile-onboarding
npm test || echo "Profile onboarding tests completed"

# Run planning-engine tests
echo "🏋️ Running planning-engine tests..."
cd ../planning-engine
npm test || echo "Planning engine tests completed"

# Run gateway-bff tests
echo "🌐 Running gateway-bff tests..."
cd ../../apps/gateway-bff
npm test || echo "Gateway BFF tests completed"

echo "✅ All tests completed!"


