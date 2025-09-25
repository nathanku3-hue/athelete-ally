#!/usr/bin/env node
/**
 * 基础设施验证脚本
 * 集成总指挥 - 验证真实基础设施连接和性能
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class InfrastructureVerifier {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      redis: { status: 'unknown', latency: 0, memory: 0, keys: 0 },
      postgresql: { status: 'unknown', latency: 0, version: '', connections: 0 },
      services: { cache: false, database: false, integration: false },
      performance: { overall: 'unknown', recommendations: [] }
    };
  }

  async verify() {
    console.log('🔍 验证基础设施连接和性能...');
    console.log('🎯 集成总指挥 - 基础设施验证报告\n');
    
    try {
      // 1. 验证Redis连接
      await this.verifyRedis();
      
      // 2. 验证PostgreSQL连接
      await this.verifyPostgreSQL();
      
      // 3. 验证服务集成
      await this.verifyServiceIntegration();
      
      // 4. 运行性能测试
      await this.runPerformanceTests();
      
      // 5. 生成验证报告
      await this.generateVerificationReport();
      
      // 6. 显示结果摘要
      this.displaySummary();
      
    } catch (error) {
      console.error('\n❌ 基础设施验证失败:', error.message);
      process.exit(1);
    }
  }

  async verifyRedis() {
    console.log('🔄 验证Redis连接...');
    
    try {
      const startTime = Date.now();
      
      // 测试连接
      execSync('redis-cli ping', { stdio: 'pipe' });
      
      // 测试写入
      execSync('redis-cli set test_key "test_value"', { stdio: 'pipe' });
      
      // 测试读取
      const result = execSync('redis-cli get test_key', { stdio: 'pipe', encoding: 'utf8' });
      
      if (result.trim() !== 'test_value') {
        throw new Error('Redis读写测试失败');
      }
      
      // 获取内存使用情况
      const memoryInfo = execSync('redis-cli info memory', { stdio: 'pipe', encoding: 'utf8' });
      const usedMemory = this.parseRedisInfo(memoryInfo, 'used_memory_human');
      
      // 获取键数量
      const keyCount = execSync('redis-cli dbsize', { stdio: 'pipe', encoding: 'utf8' });
      
      // 清理测试键
      execSync('redis-cli del test_key', { stdio: 'pipe' });
      
      const latency = Date.now() - startTime;
      
      this.results.redis = {
        status: 'connected',
        latency: latency,
        memory: usedMemory,
        keys: parseInt(keyCount.trim())
      };
      
      console.log('  ✅ Redis连接成功');
      console.log(`  📊 延迟: ${latency}ms`);
      console.log(`  💾 内存使用: ${usedMemory}`);
      console.log(`  🔑 键数量: ${keyCount.trim()}\n`);
      
    } catch (error) {
      this.results.redis.status = 'failed';
      console.error('  ❌ Redis连接失败:', error.message);
      throw error;
    }
  }

  async verifyPostgreSQL() {
    console.log('🗄️ 验证PostgreSQL连接...');
    
    try {
      const startTime = Date.now();
      
      // 测试连接
      execSync('psql -U athlete_ally_user -d athlete_ally_main -c "SELECT 1;"', { stdio: 'pipe' });
      
      // 获取版本信息
      const versionResult = execSync('psql -U athlete_ally_user -d athlete_ally_main -t -c "SELECT version();"', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      
      // 获取连接数
      const connectionsResult = execSync('psql -U athlete_ally_user -d athlete_ally_main -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = \'active\';"', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      
      // 验证RLS策略
      const rlsResult = execSync('psql -U athlete_ally_user -d athlete_ally_main -t -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\' AND tablename IN (\'protocols\', \'users\');"', { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      
      const latency = Date.now() - startTime;
      
      this.results.postgresql = {
        status: 'connected',
        latency: latency,
        version: versionResult.trim(),
        connections: parseInt(connectionsResult.trim())
      };
      
      console.log('  ✅ PostgreSQL连接成功');
      console.log(`  📊 延迟: ${latency}ms`);
      console.log(`  📋 版本: ${versionResult.trim()}`);
      console.log(`  🔗 活跃连接: ${connectionsResult.trim()}`);
      console.log(`  🔒 RLS策略: ${rlsResult.trim()}\n`);
      
    } catch (error) {
      this.results.postgresql.status = 'failed';
      console.error('  ❌ PostgreSQL连接失败:', error.message);
      throw error;
    }
  }

  async verifyServiceIntegration() {
    console.log('🔗 验证服务集成...');
    
    try {
      // 创建集成测试脚本
      const integrationTestScript = `
        const redis = require('ioredis');
        const { PrismaClient } = require('@prisma/client');
        
        async function testIntegration() {
          try {
            // 测试Redis集成
            const redisClient = new redis(process.env.REDIS_URL);
            await redisClient.ping();
            await redisClient.set('integration_test', 'success');
            const value = await redisClient.get('integration_test');
            await redisClient.del('integration_test');
            await redisClient.disconnect();
            
            if (value !== 'success') {
              throw new Error('Redis集成测试失败');
            }
            
            // 测试PostgreSQL集成
            const prisma = new PrismaClient();
            await prisma.$connect();
            await prisma.$queryRaw\`SELECT 1\`;
            await prisma.$disconnect();
            
            console.log('服务集成测试成功');
          } catch (error) {
            console.error('服务集成测试失败:', error.message);
            process.exit(1);
          }
        }
        
        testIntegration();
      `;
      
      fs.writeFileSync('temp-integration-test.js', integrationTestScript);
      
      // 运行集成测试
      execSync('node temp-integration-test.js', { stdio: 'pipe' });
      
      // 清理临时文件
      fs.unlinkSync('temp-integration-test.js');
      
      this.results.services = {
        cache: true,
        database: true,
        integration: true
      };
      
      console.log('  ✅ 服务集成验证成功\n');
      
    } catch (error) {
      this.results.services = {
        cache: false,
        database: false,
        integration: false
      };
      console.log('  ⚠️ 服务集成验证部分失败');
      console.log('  📝 错误详情:', error.message);
    }
  }

  async runPerformanceTests() {
    console.log('⚡ 运行性能测试...');
    
    try {
      const tests = [];
      
      // Redis性能测试
      const redisStart = Date.now();
      for (let i = 0; i < 100; i++) {
        execSync(`redis-cli set perf_test_${i} "value_${i}"`, { stdio: 'pipe' });
      }
      for (let i = 0; i < 100; i++) {
        execSync(`redis-cli get perf_test_${i}`, { stdio: 'pipe' });
      }
      for (let i = 0; i < 100; i++) {
        execSync(`redis-cli del perf_test_${i}`, { stdio: 'pipe' });
      }
      const redisTime = Date.now() - redisStart;
      
      // PostgreSQL性能测试
      const dbStart = Date.now();
      for (let i = 0; i < 10; i++) {
        execSync('psql -U athlete_ally_user -d athlete_ally_main -c "SELECT 1;"', { stdio: 'pipe' });
      }
      const dbTime = Date.now() - dbStart;
      
      tests.push({
        name: 'Redis批量操作',
        duration: redisTime,
        operations: 300,
        opsPerSecond: Math.round(300000 / redisTime)
      });
      
      tests.push({
        name: 'PostgreSQL连接测试',
        duration: dbTime,
        operations: 10,
        opsPerSecond: Math.round(10000 / dbTime)
      });
      
      // 性能评估
      let overallPerformance = 'excellent';
      const recommendations = [];
      
      if (redisTime > 1000) {
        overallPerformance = 'poor';
        recommendations.push('Redis性能较差，建议检查配置或网络');
      } else if (redisTime > 500) {
        overallPerformance = 'fair';
        recommendations.push('Redis性能一般，建议优化配置');
      }
      
      if (dbTime > 500) {
        overallPerformance = 'poor';
        recommendations.push('PostgreSQL性能较差，建议检查连接池配置');
      } else if (dbTime > 200) {
        overallPerformance = 'fair';
        recommendations.push('PostgreSQL性能一般，建议优化查询');
      }
      
      this.results.performance = {
        overall: overallPerformance,
        tests: tests,
        recommendations: recommendations
      };
      
      console.log('  ✅ 性能测试完成');
      tests.forEach(test => {
        console.log(`  📊 ${test.name}: ${test.opsPerSecond} ops/sec`);
      });
      console.log(`  🎯 整体性能: ${overallPerformance}\n`);
      
    } catch (error) {
      console.log('  ⚠️ 性能测试部分失败');
      console.log('  📝 错误详情:', error.message);
    }
  }

  async generateVerificationReport() {
    console.log('📊 生成验证报告...');
    
    const reportPath = path.join(this.projectRoot, 'docs/infrastructure/INFRASTRUCTURE_VERIFICATION_REPORT.md');
    const reportContent = `# 基础设施验证报告

## 🎯 验证概览
**验证时间**: ${this.results.timestamp}
**验证类型**: 生产基础设施连接验证
**整体状态**: ${this.getOverallStatus()}

## 📊 Redis状态

### 连接状态
- **状态**: ${this.results.redis.status}
- **延迟**: ${this.results.redis.latency}ms
- **内存使用**: ${this.results.redis.memory}
- **键数量**: ${this.results.redis.keys}

### 性能指标
${this.results.performance.tests ? this.results.performance.tests
  .filter(t => t.name.includes('Redis'))
  .map(t => `- **${t.name}**: ${t.opsPerSecond} ops/sec`)
  .join('\n') : '- 无性能数据'}

## 🗄️ PostgreSQL状态

### 连接状态
- **状态**: ${this.results.postgresql.status}
- **延迟**: ${this.results.postgresql.latency}ms
- **版本**: ${this.results.postgresql.version}
- **活跃连接**: ${this.results.postgresql.connections}

### 性能指标
${this.results.performance.tests ? this.results.performance.tests
  .filter(t => t.name.includes('PostgreSQL'))
  .map(t => `- **${t.name}**: ${t.opsPerSecond} ops/sec`)
  .join('\n') : '- 无性能数据'}

## 🔗 服务集成状态

- **缓存服务**: ${this.results.services.cache ? '✅ 正常' : '❌ 异常'}
- **数据库服务**: ${this.results.services.database ? '✅ 正常' : '❌ 异常'}
- **服务集成**: ${this.results.services.integration ? '✅ 正常' : '❌ 异常'}

## ⚡ 性能评估

### 整体性能
**等级**: ${this.results.performance.overall}

### 优化建议
${this.results.performance.recommendations.length > 0 
  ? this.results.performance.recommendations.map(rec => `- ${rec}`).join('\n')
  : '- 无优化建议'}

## 🎯 Engineer B测试准备状态

### 基础设施就绪度
- **Redis**: ${this.results.redis.status === 'connected' ? '✅ 就绪' : '❌ 未就绪'}
- **PostgreSQL**: ${this.results.postgresql.status === 'connected' ? '✅ 就绪' : '❌ 未就绪'}
- **服务集成**: ${this.results.services.integration ? '✅ 就绪' : '❌ 未就绪'}

### 测试环境状态
${this.getOverallStatus() === 'ready' ? '✅ 完全就绪 - Engineer B可以开始最终测试' : '⚠️ 部分就绪 - 需要解决上述问题'}

## 🚀 下一步行动

${this.getOverallStatus() === 'ready' 
  ? '1. Engineer B可以开始最终测试\n2. 运行完整测试套件\n3. 验证所有功能正常\n4. 确认性能指标达标'
  : '1. 解决上述基础设施问题\n2. 重新运行验证脚本\n3. 确保所有服务正常\n4. 再次验证测试环境'}

---

**报告生成时间**: ${new Date().toISOString()}
**验证脚本版本**: 1.0.0
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log('  ✅ 验证报告生成完成');
    console.log(`  📄 报告路径: ${reportPath}\n`);
  }

  displaySummary() {
    console.log('📋 验证结果摘要');
    console.log('==================');
    console.log(`🔄 Redis: ${this.results.redis.status} (${this.results.redis.latency}ms)`);
    console.log(`🗄️ PostgreSQL: ${this.results.postgresql.status} (${this.results.postgresql.latency}ms)`);
    console.log(`🔗 服务集成: ${this.results.services.integration ? '正常' : '异常'}`);
    console.log(`⚡ 整体性能: ${this.results.performance.overall}`);
    console.log(`🎯 测试准备: ${this.getOverallStatus()}`);
    console.log('==================\n');
    
    if (this.getOverallStatus() === 'ready') {
      console.log('🎉 基础设施验证通过！');
      console.log('🎯 Engineer B可以开始最终测试了！');
    } else {
      console.log('⚠️ 基础设施验证未完全通过');
      console.log('📝 请查看详细报告并解决问题');
    }
  }

  getOverallStatus() {
    if (this.results.redis.status === 'connected' && 
        this.results.postgresql.status === 'connected' && 
        this.results.services.integration) {
      return 'ready';
    }
    return 'not-ready';
  }

  parseRedisInfo(info, key) {
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith(key + ':')) {
        return line.split(':')[1].trim();
      }
    }
    return 'Unknown';
  }
}

// 命令行接口
if (require.main === module) {
  const verifier = new InfrastructureVerifier();
  verifier.verify();
}

module.exports = InfrastructureVerifier;
