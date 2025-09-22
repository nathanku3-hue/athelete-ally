// API测试脚本
const testAPI = async () => {
  try {
    // 测试健康检查
    console.log('🔍 Testing health check...');
    const healthResponse = await fetch('http://localhost:4102/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // 测试API文档
    console.log('🔍 Testing API docs...');
    const docsResponse = await fetch('http://localhost:4102/api/docs');
    const docsData = await docsResponse.json();
    console.log('✅ API docs:', docsData.title);

    // 测试训练计划生成
    console.log('🔍 Testing plan generation...');
    const planResponse = await fetch('http://localhost:4102/api/v1/plans/enhanced/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'test-user',
        preferences: {
          goal: 'strength',
          experience: 'intermediate'
        }
      })
    });
    const planData = await planResponse.json();
    console.log('✅ Plan generation:', planData.success ? 'SUCCESS' : 'FAILED');
    if (planData.success) {
      console.log('📋 Generated plan:', planData.data.name);
    }

    // 测试RPE反馈
    console.log('🔍 Testing RPE feedback...');
    const rpeResponse = await fetch('http://localhost:4102/api/v1/plans/feedback/rpe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: 'session-123',
        exerciseId: 'exercise-456',
        rpe: 7,
        completionRate: 100,
        notes: 'Good session'
      })
    });
    const rpeData = await rpeResponse.json();
    console.log('✅ RPE feedback:', rpeData.success ? 'SUCCESS' : 'FAILED');

    // 测试适应性调整
    console.log('🔍 Testing adaptations...');
    const adaptResponse = await fetch('http://localhost:4102/api/v1/plans/plan-123/adaptations');
    const adaptData = await adaptResponse.json();
    console.log('✅ Adaptations:', adaptData.success ? 'SUCCESS' : 'FAILED');

    console.log('🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

testAPI();


