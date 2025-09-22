#!/usr/bin/env node

/**
 * 端到端API验证测试脚本
 * 测试所有API端点的输入验证功能
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 测试用例
const testCases = [
  {
    name: 'RPE Data Submission - Valid Data',
    method: 'POST',
    endpoint: '/api/v1/rpe-data',
    data: {
      exerciseId: 'ex1',
      setNumber: 1,
      reps: 8,
      weight: 135,
      rpe: 7.5,
      userId: '123e4567-e89b-12d3-a456-426614174000',
      notes: 'Good form'
    },
    expectedStatus: 200
  },
  {
    name: 'RPE Data Submission - Invalid RPE (too high)',
    method: 'POST',
    endpoint: '/api/v1/rpe-data',
    data: {
      exerciseId: 'ex1',
      setNumber: 1,
      reps: 8,
      weight: 135,
      rpe: 15, // Invalid: RPE must be 1-10
      userId: '123e4567-e89b-12d3-a456-426614174000'
    },
    expectedStatus: 400
  },
  {
    name: 'RPE Data Submission - Missing Required Fields',
    method: 'POST',
    endpoint: '/api/v1/rpe-data',
    data: {
      exerciseId: 'ex1',
      // Missing setNumber, reps, weight, rpe
      userId: '123e4567-e89b-12d3-a456-426614174000'
    },
    expectedStatus: 400
  },
  {
    name: 'RPE Data Query - Valid Parameters',
    method: 'GET',
    endpoint: '/api/v1/rpe-data?userId=123e4567-e89b-12d3-a456-426614174000&limit=10',
    expectedStatus: 200
  },
  {
    name: 'RPE Data Query - Invalid UUID',
    method: 'GET',
    endpoint: '/api/v1/rpe-data?userId=invalid-uuid',
    expectedStatus: 400
  },
  {
    name: 'User Preferences Update - Valid Data',
    method: 'PATCH',
    endpoint: '/api/v1/user/preferences',
    data: {
      unit: 'kg',
      theme: 'dark',
      notifications: true
    },
    expectedStatus: 200
  },
  {
    name: 'User Preferences Update - Invalid Unit',
    method: 'PATCH',
    endpoint: '/api/v1/user/preferences',
    data: {
      unit: 'pounds', // Invalid: must be 'lbs' or 'kg'
      theme: 'dark'
    },
    expectedStatus: 400
  },
  {
    name: 'User Preferences Update - Invalid Theme',
    method: 'PATCH',
    endpoint: '/api/v1/user/preferences',
    data: {
      unit: 'lbs',
      theme: 'neon' // Invalid: must be 'light', 'dark', or 'auto'
    },
    expectedStatus: 400
  },
  {
    name: 'User Preferences Get',
    method: 'GET',
    endpoint: '/api/v1/user/preferences',
    expectedStatus: 200
  }
];

async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    return {
      status: response.status,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message
    };
  }
}

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   ${testCase.method} ${testCase.endpoint}`);
  
  const result = await makeRequest(testCase.method, testCase.endpoint, testCase.data);
  
  const passed = result.status === testCase.expectedStatus;
  const status = passed ? '✅ PASS' : '❌ FAIL';
  
  console.log(`   Status: ${status}`);
  console.log(`   Expected: ${testCase.expectedStatus}, Got: ${result.status}`);
  
  if (result.data) {
    if (result.status >= 400) {
      console.log(`   Error: ${result.data.error || 'Unknown error'}`);
      if (result.data.details) {
        console.log(`   Details: ${JSON.stringify(result.data.details, null, 2)}`);
      }
    } else {
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    }
  }
  
  if (result.error) {
    console.log(`   Network Error: ${result.error}`);
  }
  
  return passed;
}

async function runAllTests() {
  console.log('🚀 Starting API Validation Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  let passed = 0;
  let total = testCases.length;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) passed++;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! API validation is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// 检查是否在Node.js环境中运行
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with built-in fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runAllTests().catch(console.error);

