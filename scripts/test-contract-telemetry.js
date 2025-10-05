#!/usr/bin/env node
/**
 * Test script for contract telemetry and configuration
 */

const { 
  recordLegacyMapping, 
  getContractMetrics, 
  hasActiveLegacyUsage,
  getContractConfig,
  shouldApplyLegacyMapping,
  isTelemetryEnabled
} = require('@athlete-ally/shared-types');

console.log('🧪 Testing Contract Telemetry and Configuration\n');

// Test configuration
console.log('📋 Current Configuration:');
const config = getContractConfig();
console.log(JSON.stringify(config, null, 2));

// Test telemetry
console.log('\n📊 Testing Telemetry:');
recordLegacyMapping('fatigue_level', 'moderate', 'test');
recordLegacyMapping('season', 'offseason', 'test');
recordLegacyMapping('season', 'preseason', 'test');

const metrics = getContractMetrics();
console.log('Metrics Summary:', JSON.stringify(metrics, null, 2));

// Test legacy usage detection
const hasLegacy = hasActiveLegacyUsage(1); // Check last hour
console.log(`\n🔍 Has active legacy usage (last hour): ${hasLegacy}`);

// Test configuration functions
console.log(`\n⚙️ Legacy mapping enabled: ${shouldApplyLegacyMapping()}`);
console.log(`📈 Telemetry enabled: ${isTelemetryEnabled()}`);

console.log('\n✅ All tests completed successfully!');
