#!/usr/bin/env node
/**
 * 测试数据创建脚本
 * 为Engineer B的测试套件创建必要的测试数据
 */

const { PrismaClient } = require('@prisma/client');

class TestDataCreator {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/athlete_ally_test'
        }
      }
    });
  }

  async createTestData() {
    console.log('📊 开始创建测试数据...');
    
    try {
      // 1. 创建测试租户
      await this.createTestTenants();
      
      // 2. 创建测试用户
      await this.createTestUsers();
      
      // 3. 创建测试协议
      await this.createTestProtocols();
      
      // 4. 创建测试权限
      await this.createTestPermissions();
      
      // 5. 创建测试分享
      await this.createTestShares();
      
      // 6. 创建测试块
      await this.createTestBlocks();
      
      console.log('✅ 测试数据创建完成！');
    } catch (error) {
      console.error('❌ 测试数据创建失败:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async createTestTenants() {
    console.log('  🏢 创建测试租户...');
    
    const tenants = [
      {
        id: 'test_tenant_1',
        name: 'Test Tenant 1',
        domain: 'test1.athlete-ally.com',
        isActive: true,
        maxUsers: 100,
        maxProtocols: 1000
      },
      {
        id: 'test_tenant_2',
        name: 'Test Tenant 2',
        domain: 'test2.athlete-ally.com',
        isActive: true,
        maxUsers: 50,
        maxProtocols: 500
      }
    ];

    for (const tenant of tenants) {
      await this.prisma.tenant.upsert({
        where: { id: tenant.id },
        update: tenant,
        create: tenant
      });
    }
    
    console.log('    ✅ 创建了 2 个测试租户');
  }

  async createTestUsers() {
    console.log('  👥 创建测试用户...');
    
    const users = [
      // 租户1的用户
      {
        id: 'test_user_1',
        email: 'user1@test1.com',
        name: 'Test User 1',
        tenantId: 'test_tenant_1',
        isActive: true,
        lastLoginAt: new Date()
      },
      {
        id: 'test_user_2',
        email: 'user2@test1.com',
        name: 'Test User 2',
        tenantId: 'test_tenant_1',
        isActive: true,
        lastLoginAt: new Date()
      },
      {
        id: 'test_user_3',
        email: 'user3@test1.com',
        name: 'Test User 3',
        tenantId: 'test_tenant_1',
        isActive: true,
        lastLoginAt: new Date()
      },
      // 租户2的用户
      {
        id: 'test_user_4',
        email: 'user4@test2.com',
        name: 'Test User 4',
        tenantId: 'test_tenant_2',
        isActive: true,
        lastLoginAt: new Date()
      }
    ];

    for (const user of users) {
      await this.prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    
    console.log('    ✅ 创建了 4 个测试用户');
  }

  async createTestProtocols() {
    console.log('  📋 创建测试协议...');
    
    const protocols = [
      {
        id: 'protocol_1',
        name: '5/3/1 Strength Program',
        description: 'A proven strength training program for intermediate lifters',
        category: 'strength',
        difficulty: 'intermediate',
        duration: 12,
        frequency: 3,
        ownerId: 'test_user_1',
        tenantId: 'test_tenant_1',
        visibility: 'PRIVATE',
        isActive: true,
        isPublic: false,
        overview: 'This program focuses on building strength through progressive overload',
        principles: ['Progressive overload', 'Periodization', 'Recovery'],
        requirements: ['Barbell', 'Plates', 'Squat rack', 'Bench']
      },
      {
        id: 'protocol_2',
        name: 'Hypertrophy Focus Program',
        description: 'A muscle building program for advanced trainees',
        category: 'hypertrophy',
        difficulty: 'advanced',
        duration: 16,
        frequency: 4,
        ownerId: 'test_user_1',
        tenantId: 'test_tenant_1',
        visibility: 'PRIVATE',
        isActive: true,
        isPublic: false,
        overview: 'This program maximizes muscle growth through volume and intensity',
        principles: ['Volume progression', 'Time under tension', 'Muscle confusion'],
        requirements: ['Dumbbells', 'Cables', 'Machines', 'Bodyweight']
      },
      {
        id: 'protocol_3',
        name: 'Beginner Full Body',
        description: 'A simple full body program for beginners',
        category: 'general_fitness',
        difficulty: 'beginner',
        duration: 8,
        frequency: 3,
        ownerId: 'test_user_2',
        tenantId: 'test_tenant_1',
        visibility: 'PUBLIC',
        isActive: true,
        isPublic: true,
        overview: 'Perfect for those new to strength training',
        principles: ['Movement patterns', 'Progressive overload', 'Consistency'],
        requirements: ['Bodyweight', 'Dumbbells', 'Resistance bands']
      },
      {
        id: 'protocol_4',
        name: 'Powerlifting Peaking',
        description: 'A peaking program for powerlifting competitions',
        category: 'powerlifting',
        difficulty: 'elite',
        duration: 6,
        frequency: 4,
        ownerId: 'test_user_4',
        tenantId: 'test_tenant_2',
        visibility: 'PRIVATE',
        isActive: true,
        isPublic: false,
        overview: 'Peaking program for powerlifting competitions',
        principles: ['Intensity', 'Specificity', 'Tapering'],
        requirements: ['Competition equipment', 'Spotter', 'Chalk']
      }
    ];

    for (const protocol of protocols) {
      await this.prisma.protocol.upsert({
        where: { id: protocol.id },
        update: protocol,
        create: protocol
      });
    }
    
    console.log('    ✅ 创建了 4 个测试协议');
  }

  async createTestPermissions() {
    console.log('  🔐 创建测试权限...');
    
    const permissions = [
      {
        id: 'permission_1',
        protocolId: 'protocol_1',
        userId: 'test_user_2',
        role: 'EDITOR',
        permissions: ['READ', 'WRITE', 'EXECUTE'],
        grantedBy: 'test_user_1',
        grantedAt: new Date(),
        isActive: true
      },
      {
        id: 'permission_2',
        protocolId: 'protocol_1',
        userId: 'test_user_3',
        role: 'VIEWER',
        permissions: ['READ'],
        grantedBy: 'test_user_1',
        grantedAt: new Date(),
        isActive: true
      },
      {
        id: 'permission_3',
        protocolId: 'protocol_2',
        userId: 'test_user_2',
        role: 'ADMIN',
        permissions: ['READ', 'WRITE', 'EXECUTE', 'SHARE', 'DELETE'],
        grantedBy: 'test_user_1',
        grantedAt: new Date(),
        isActive: true
      }
    ];

    for (const permission of permissions) {
      await this.prisma.protocolPermission.upsert({
        where: { id: permission.id },
        update: permission,
        create: permission
      });
    }
    
    console.log('    ✅ 创建了 3 个测试权限');
  }

  async createTestShares() {
    console.log('  🤝 创建测试分享...');
    
    const shares = [
      {
        id: 'share_1',
        protocolId: 'protocol_1',
        sharedBy: 'test_user_1',
        sharedWith: 'test_user_2',
        permissions: ['READ', 'EXECUTE'],
        isActive: true,
        acceptedAt: new Date()
      },
      {
        id: 'share_2',
        protocolId: 'protocol_1',
        sharedBy: 'test_user_1',
        sharedWith: 'test_user_3',
        permissions: ['READ'],
        isActive: true,
        acceptedAt: new Date()
      },
      {
        id: 'share_3',
        protocolId: 'protocol_2',
        sharedBy: 'test_user_1',
        sharedWith: 'test_user_2',
        permissions: ['READ', 'WRITE', 'EXECUTE'],
        isActive: true,
        acceptedAt: new Date()
      }
    ];

    for (const share of shares) {
      await this.prisma.protocolShare.upsert({
        where: { id: share.id },
        update: share,
        create: share
      });
    }
    
    console.log('    ✅ 创建了 3 个测试分享');
  }

  async createTestBlocks() {
    console.log('  🧱 创建测试块...');
    
    const blocks = [
      // 协议1的块
      {
        id: 'block_1_1',
        protocolId: 'protocol_1',
        name: 'Base Building Phase',
        description: 'Foundation building phase',
        order: 1,
        duration: 4,
        phase: 'base',
        intensity: 'moderate',
        volume: 'high',
        parameters: {
          sets: 3,
          reps: '8-12',
          rest: '2-3 minutes'
        }
      },
      {
        id: 'block_1_2',
        protocolId: 'protocol_1',
        name: 'Strength Phase',
        description: 'Strength building phase',
        order: 2,
        duration: 4,
        phase: 'build',
        intensity: 'high',
        volume: 'moderate',
        parameters: {
          sets: 4,
          reps: '3-5',
          rest: '3-5 minutes'
        }
      },
      {
        id: 'block_1_3',
        protocolId: 'protocol_1',
        name: 'Peak Phase',
        description: 'Peak strength phase',
        order: 3,
        duration: 4,
        phase: 'peak',
        intensity: 'very_high',
        volume: 'low',
        parameters: {
          sets: 5,
          reps: '1-3',
          rest: '5+ minutes'
        }
      },
      // 协议2的块
      {
        id: 'block_2_1',
        protocolId: 'protocol_2',
        name: 'Volume Accumulation',
        description: 'High volume phase for muscle growth',
        order: 1,
        duration: 8,
        phase: 'base',
        intensity: 'moderate',
        volume: 'very_high',
        parameters: {
          sets: 4,
          reps: '10-15',
          rest: '1-2 minutes'
        }
      },
      {
        id: 'block_2_2',
        protocolId: 'protocol_2',
        name: 'Intensity Phase',
        description: 'Higher intensity phase',
        order: 2,
        duration: 8,
        phase: 'build',
        intensity: 'high',
        volume: 'high',
        parameters: {
          sets: 5,
          reps: '6-10',
          rest: '2-3 minutes'
        }
      }
    ];

    for (const block of blocks) {
      await this.prisma.block.upsert({
        where: { id: block.id },
        update: block,
        create: block
      });
    }
    
    console.log('    ✅ 创建了 5 个测试块');
  }

  async cleanup() {
    console.log('🧹 清理测试数据...');
    
    try {
      // 按依赖关系顺序删除
      await this.prisma.protocolShare.deleteMany();
      await this.prisma.protocolPermission.deleteMany();
      await this.prisma.block.deleteMany();
      await this.prisma.protocol.deleteMany();
      await this.prisma.user.deleteMany();
      await this.prisma.tenant.deleteMany();
      
      console.log('  ✅ 测试数据清理完成');
    } catch (error) {
      console.error('  ❌ 测试数据清理失败:', error.message);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const creator = new TestDataCreator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      creator.createTestData();
      break;
    case 'cleanup':
      creator.cleanup();
      break;
    default:
      console.log('用法: node create-test-data.js [create|cleanup]');
      process.exit(1);
  }
}

module.exports = TestDataCreator;
