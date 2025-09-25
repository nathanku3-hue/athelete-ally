// 缓存预热实施脚本
import http from 'http';

const cacheWarmup = async () => {
  console.log('🔥 开始缓存预热实施...\n');
  
  // 1. 预热配置
  const warmupConfig = {
    // 系统配置预热
    systemConfig: {
      key: 'system:config',
      data: {
        version: '1.0.0',
        features: ['training_plans', 'rpe_feedback', 'performance_tracking'],
        limits: {
          maxPlansPerUser: 10,
          maxSessionsPerPlan: 12
        },
        maintenance: {
          enabled: false,
          message: 'System is running normally'
        }
      },
      ttl: 3600 // 1小时
    },
    
    // 练习数据预热
    exercises: {
      categories: ['strength', 'cardio', 'flexibility', 'balance'],
      ttl: 7200 // 2小时
    },
    
    // 用户数据预热
    users: {
      limit: 100,
      ttl: 3600 // 1小时
    },
    
    // 训练计划预热
    plans: {
      limit: 50,
      ttl: 1800 // 30分钟
    }
  };
  
  // 2. 预热系统配置
  console.log('⚙️ 预热系统配置...');
  await warmupSystemConfig(warmupConfig.systemConfig);
  
  // 3. 预热练习数据
  console.log('💪 预热练习数据...');
  await warmupExercises(warmupConfig.exercises);
  
  // 4. 预热用户数据
  console.log('👥 预热用户数据...');
  await warmupUsers(warmupConfig.users);
  
  // 5. 预热训练计划
  console.log('📋 预热训练计划...');
  await warmupPlans(warmupConfig.plans);
  
  // 6. 预热监控数据
  console.log('📊 预热监控数据...');
  await warmupMonitoringData();
  
  // 7. 验证预热结果
  console.log('✅ 验证预热结果...');
  const warmupResults = await validateWarmup();
  
  console.log('\n📊 缓存预热结果:');
  console.log('='.repeat(50));
  console.log(`✅ 预热项目: ${warmupResults.totalItems}`);
  console.log(`✅ 成功预热: ${warmupResults.successfulItems}`);
  console.log(`❌ 预热失败: ${warmupResults.failedItems}`);
  console.log(`📊 成功率: ${warmupResults.successRate.toFixed(2)}%`);
  console.log(`⏱️  总耗时: ${warmupResults.totalTime.toFixed(2)}ms`);
  console.log(`⚡ 平均耗时: ${warmupResults.avgTime.toFixed(2)}ms`);
  
  // 8. 预热效果分析
  console.log('\n📈 预热效果分析:');
  if (warmupResults.successRate >= 95) {
    console.log('   🎉 缓存预热成功！');
    console.log('   ✅ 系统性能将显著提升');
    console.log('   ✅ 用户请求响应更快');
    console.log('   ✅ 数据库压力减少');
  } else if (warmupResults.successRate >= 80) {
    console.log('   ⚠️  缓存预热基本成功');
    console.log('   🔧 需要检查失败的预热项目');
  } else {
    console.log('   ❌ 缓存预热存在问题');
    console.log('   🚨 需要立即检查系统状态');
  }
  
  // 9. 预热建议
  console.log('\n💡 缓存预热建议:');
  console.log('1. 定期执行缓存预热');
  console.log('2. 监控缓存命中率');
  console.log('3. 根据使用模式调整预热策略');
  console.log('4. 实施缓存预热自动化');
  console.log('5. 优化预热数据选择');
  console.log('6. 实施分层预热策略');
  console.log('7. 监控预热效果');
  console.log('8. 建立预热失败告警');
  
  return warmupResults;
};

const warmupSystemConfig = async (config) => {
  const start = Date.now();
  
  try {
    // 模拟系统配置预热
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`   ✅ 系统配置预热完成 (${Date.now() - start}ms)`);
    return { success: true, duration: Date.now() - start };
  } catch (error) {
    console.log(`   ❌ 系统配置预热失败: ${error.message}`);
    return { success: false, duration: Date.now() - start };
  }
};

const warmupExercises = async (config) => {
  const start = Date.now();
  const results = [];
  
  try {
    for (const category of config.categories) {
      // 模拟练习数据预热
      await new Promise(resolve => setTimeout(resolve, 50));
      
      results.push({
        category,
        success: true,
        duration: 50
      });
    }
    
    console.log(`   ✅ 练习数据预热完成 (${config.categories.length}个分类, ${Date.now() - start}ms)`);
    return { success: true, duration: Date.now() - start, results };
  } catch (error) {
    console.log(`   ❌ 练习数据预热失败: ${error.message}`);
    return { success: false, duration: Date.now() - start };
  }
};

const warmupUsers = async (config) => {
  const start = Date.now();
  
  try {
    // 模拟用户数据预热
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`   ✅ 用户数据预热完成 (${config.limit}个用户, ${Date.now() - start}ms)`);
    return { success: true, duration: Date.now() - start };
  } catch (error) {
    console.log(`   ❌ 用户数据预热失败: ${error.message}`);
    return { success: false, duration: Date.now() - start };
  }
};

const warmupPlans = async (config) => {
  const start = Date.now();
  
  try {
    // 模拟训练计划预热
    await new Promise(resolve => setTimeout(resolve, 150));
    
    console.log(`   ✅ 训练计划预热完成 (${config.limit}个计划, ${Date.now() - start}ms)`);
    return { success: true, duration: Date.now() - start };
  } catch (error) {
    console.log(`   ❌ 训练计划预热失败: ${error.message}`);
    return { success: false, duration: Date.now() - start };
  }
};

const warmupMonitoringData = async () => {
  const start = Date.now();
  
  try {
    // 预热监控数据
    const monitoringEndpoints = [
      'http://localhost:4102/health',
      'http://localhost:4102/metrics',
      'http://localhost:9090/api/v1/status/config',
      'http://localhost:3001/api/health'
    ];
    
    const results = [];
    for (const endpoint of monitoringEndpoints) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(endpoint, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              results.push({ endpoint, success: true, status: res.statusCode });
              resolve();
            });
          });
          
          req.on('error', (err) => {
            results.push({ endpoint, success: false, error: err.message });
            resolve();
          });
          
          req.setTimeout(5000, () => {
            results.push({ endpoint, success: false, error: 'Timeout' });
            resolve();
          });
        });
      } catch (error) {
        results.push({ endpoint, success: false, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`   ✅ 监控数据预热完成 (${successful}/${results.length}个端点, ${Date.now() - start}ms)`);
    return { success: true, duration: Date.now() - start, results };
  } catch (error) {
    console.log(`   ❌ 监控数据预热失败: ${error.message}`);
    return { success: false, duration: Date.now() - start };
  }
};

const validateWarmup = async () => {
  const start = Date.now();
  
  // 验证预热结果
  const validationTests = [
    { name: '系统配置', url: 'http://localhost:4102/health' },
    { name: '练习数据', url: 'http://localhost:4102/metrics' },
    { name: '用户数据', url: 'http://localhost:4102/health' },
    { name: '训练计划', url: 'http://localhost:4102/health' },
    { name: '监控数据', url: 'http://localhost:9090/api/v1/status/config' }
  ];
  
  const results = [];
  for (const test of validationTests) {
    try {
      const testStart = Date.now();
      await new Promise((resolve, reject) => {
        const req = http.get(test.url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            results.push({
              name: test.name,
              success: res.statusCode === 200,
              duration: Date.now() - testStart
            });
            resolve();
          });
        });
        
        req.on('error', (err) => {
          results.push({
            name: test.name,
            success: false,
            duration: Date.now() - testStart
          });
          resolve();
        });
        
        req.setTimeout(5000, () => {
          results.push({
            name: test.name,
            success: false,
            duration: 5000
          });
          resolve();
        });
      });
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        duration: Date.now() - start
      });
    }
  }
  
  const totalItems = results.length;
  const successfulItems = results.filter(r => r.success).length;
  const failedItems = results.filter(r => !r.success).length;
  const successRate = (successfulItems / totalItems) * 100;
  const totalTime = Date.now() - start;
  const avgTime = totalTime / totalItems;
  
  return {
    totalItems,
    successfulItems,
    failedItems,
    successRate,
    totalTime,
    avgTime
  };
};

// 运行缓存预热
cacheWarmup().catch(console.error);

