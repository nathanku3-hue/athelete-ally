#!/usr/bin/env tsx

/**
 * Health endpoints smoke test
 * Tests the unified health schema across services
 */

import { validateHealthResponse } from '@athlete-ally/health-schema';

interface ServiceConfig {
  name: string;
  port: number;
  path: string;
}

const SERVICES: ServiceConfig[] = [
  { name: 'fatigue-service', port: 3001, path: '/health' },
  { name: 'workouts-service', port: 3002, path: '/health' },
  { name: 'frontend', port: 3000, path: '/api/health' },
];

async function testHealthEndpoint(service: ServiceConfig): Promise<boolean> {
  const url = `http://localhost:${service.port}${service.path}`;
  
  try {
    console.log(`🔍 Testing ${service.name} at ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.log(`❌ ${service.name}: HTTP ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    
    // Validate the health response schema
    if (!validateHealthResponse(data)) {
      console.log(`❌ ${service.name}: Invalid health response schema`);
      console.log(`   Expected: { ok, status, sha, buildId, service, uptimeSec, timestamp }`);
      console.log(`   Got:`, Object.keys(data));
      return false;
    }

    // Check required fields
    const requiredFields = ['ok', 'status', 'sha', 'buildId', 'service', 'uptimeSec', 'timestamp'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.log(`❌ ${service.name}: Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Check status values
    if (!['healthy', 'degraded', 'unhealthy'].includes(data.status)) {
      console.log(`❌ ${service.name}: Invalid status value: ${data.status}`);
      return false;
    }

    // Check service name matches
    if (data.service !== service.name) {
      console.log(`❌ ${service.name}: Service name mismatch. Expected: ${service.name}, Got: ${data.service}`);
      return false;
    }

    console.log(`✅ ${service.name}: Health check passed`);
    console.log(`   Status: ${data.status} (ok: ${data.ok})`);
    console.log(`   Service: ${data.service} v${data.version || 'unknown'}`);
    console.log(`   Environment: ${data.environment || 'unknown'}`);
    console.log(`   Uptime: ${data.uptimeSec}s`);
    console.log(`   SHA: ${data.sha?.substring(0, 8) || 'unknown'}`);
    console.log(`   Build ID: ${data.buildId || 'unknown'}`);
    
    return true;
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log(`⏰ ${service.name}: Request timeout (5s)`);
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(`🔌 ${service.name}: Connection refused (service not running)`);
      } else {
        console.log(`❌ ${service.name}: ${error.message}`);
      }
    } else {
      console.log(`❌ ${service.name}: Unknown error`);
    }
    return false;
  }
}

async function main() {
  console.log('🏥 Health Endpoints Smoke Test');
  console.log('==============================');
  
  const results = await Promise.all(
    SERVICES.map(async (service) => ({
      service: service.name,
      passed: await testHealthEndpoint(service)
    }))
  );

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n📊 Results Summary');
  console.log('==================');
  console.log(`Passed: ${passed}/${total}`);
  
  results.forEach(({ service, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${service}`);
  });

  // Write results to file for CI
  const fs = await import('fs');
  const resultsData = {
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed: total - passed,
    services: results,
    summary: `${passed}/${total} services passed health checks`
  };
  
  fs.writeFileSync('health-test-results.json', JSON.stringify(resultsData, null, 2));

  if (passed === total) {
    console.log('\n🎉 All health endpoints are working correctly!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${total - passed} service(s) failed health checks`);
    console.log('   This is non-blocking in CI, but services should be investigated');
    process.exit(0); // Non-blocking exit code
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Health test interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Health test terminated');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Health test failed:', error);
  process.exit(1);
});
