#!/usr/bin/env node
/**
 * 测试环境设置脚本
 * 用于支持Engineer B的端到端测试集成
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestEnvironmentSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/athlete_ally_test';
    this.redisUrl = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
  }

  async setup() {
    console.log('🚀 开始设置测试环境...');
    
    try {
      // 1. 检查依赖
      await this.checkDependencies();
      
      // 2. 设置测试数据库
      await this.setupTestDatabase();
      
      // 3. 应用RLS策略
      await this.applyRLSPolicies();
      
      // 4. 设置Redis缓存
      await this.setupRedisCache();
      
      // 5. 运行数据库迁移
      await this.runMigrations();
      
      // 6. 创建测试数据
      await this.createTestData();
      
      // 7. 验证环境
      await this.validateEnvironment();
      
      console.log('✅ 测试环境设置完成！');
    } catch (error) {
      console.error('❌ 测试环境设置失败:', error.message);
      process.exit(1);
    }
  }

  async checkDependencies() {
    console.log('📋 检查依赖...');
    
    const requiredCommands = ['node', 'npm', 'psql', 'redis-cli'];
    
    for (const cmd of requiredCommands) {
      try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
        console.log(`  ✅ ${cmd} 已安装`);
      } catch (error) {
        throw new Error(`缺少依赖: ${cmd}`);
      }
    }
  }

  async setupTestDatabase() {
    console.log('🗄️ 设置测试数据库...');
    
    try {
      // 创建测试数据库
      execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS athlete_ally_test;"`, { stdio: 'inherit' });
      execSync(`psql -U postgres -c "CREATE DATABASE athlete_ally_test;"`, { stdio: 'inherit' });
      
      // 创建测试用户
      execSync(`psql -U postgres -c "DROP USER IF EXISTS test_user;"`, { stdio: 'inherit' });
      execSync(`psql -U postgres -c "CREATE USER test_user WITH PASSWORD 'test_password';"`, { stdio: 'inherit' });
      execSync(`psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE athlete_ally_test TO test_user;"`, { stdio: 'inherit' });
      
      console.log('  ✅ 测试数据库创建成功');
    } catch (error) {
      console.error('  ❌ 测试数据库创建失败:', error.message);
      throw error;
    }
  }

  async applyRLSPolicies() {
    console.log('🔒 应用RLS策略...');
    
    try {
      const rlsScriptPath = path.join(this.projectRoot, 'services/protocol-engine/sql/rls_policies.sql');
      
      if (fs.existsSync(rlsScriptPath)) {
        execSync(`psql -U test_user -d athlete_ally_test -f ${rlsScriptPath}`, { stdio: 'inherit' });
        console.log('  ✅ RLS策略应用成功');
      } else {
        console.log('  ⚠️ RLS策略文件不存在，跳过');
      }
    } catch (error) {
      console.error('  ❌ RLS策略应用失败:', error.message);
      throw error;
    }
  }

  async setupRedisCache() {
    console.log('🔄 设置Redis缓存...');
    
    try {
      // 检查Redis连接
      execSync(`redis-cli ping`, { stdio: 'inherit' });
      
      // 清空测试数据库
      execSync(`redis-cli -n 1 FLUSHDB`, { stdio: 'inherit' });
      
      console.log('  ✅ Redis缓存设置成功');
    } catch (error) {
      console.error('  ❌ Redis缓存设置失败:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    console.log('🔄 运行数据库迁移...');
    
    try {
      // 设置环境变量
      process.env.DATABASE_URL = this.testDbUrl;
      
      // 运行Prisma迁移
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: path.join(this.projectRoot, 'services/protocol-engine')
      });
      
      console.log('  ✅ 数据库迁移完成');
    } catch (error) {
      console.error('  ❌ 数据库迁移失败:', error.message);
      throw error;
    }
  }

  async createTestData() {
    console.log('📊 创建测试数据...');
    
    try {
      // 运行测试数据创建脚本
      execSync('node scripts/create-test-data.js', { 
        stdio: 'inherit',
        cwd: this.projectRoot
      });
      
      console.log('  ✅ 测试数据创建成功');
    } catch (error) {
      console.error('  ❌ 测试数据创建失败:', error.message);
      throw error;
    }
  }

  async validateEnvironment() {
    console.log('✅ 验证测试环境...');
    
    try {
      // 验证数据库连接
      execSync(`psql -U test_user -d athlete_ally_test -c "SELECT 1;"`, { stdio: 'inherit' });
      
      // 验证Redis连接
      execSync(`redis-cli ping`, { stdio: 'inherit' });
      
      // 验证表结构
      const tables = execSync(`psql -U test_user -d athlete_ally_test -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"`, { encoding: 'utf8' });
      const tableCount = tables.trim().split('\n').filter(line => line.trim()).length;
      
      if (tableCount > 0) {
        console.log(`  ✅ 数据库表结构验证成功 (${tableCount} 个表)`);
      } else {
        throw new Error('数据库中没有表');
      }
      
      console.log('  ✅ 测试环境验证成功');
    } catch (error) {
      console.error('  ❌ 测试环境验证失败:', error.message);
      throw error;
    }
  }

  async teardown() {
    console.log('🧹 清理测试环境...');
    
    try {
      // 清理测试数据库
      execSync(`psql -U postgres -c "DROP DATABASE IF EXISTS athlete_ally_test;"`, { stdio: 'inherit' });
      execSync(`psql -U postgres -c "DROP USER IF EXISTS test_user;"`, { stdio: 'inherit' });
      
      // 清理Redis缓存
      execSync(`redis-cli -n 1 FLUSHDB`, { stdio: 'inherit' });
      
      console.log('  ✅ 测试环境清理完成');
    } catch (error) {
      console.error('  ❌ 测试环境清理失败:', error.message);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      setup.setup();
      break;
    case 'teardown':
      setup.teardown();
      break;
    case 'validate':
      setup.validateEnvironment();
      break;
    default:
      console.log('用法: node setup-test-environment.js [setup|teardown|validate]');
      process.exit(1);
  }
}

module.exports = TestEnvironmentSetup;
