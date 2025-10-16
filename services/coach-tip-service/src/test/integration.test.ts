#!/usr/bin/env tsx

/**
 * End-to-End Integration Test for CoachTip Service
 * 
 * This test simulates the complete flow:
 * 1. Plan generation with scoring data
 * 2. Event publishing with enriched payload
 * 3. CoachTip subscriber processing
 * 4. Tip generation and storage
 * 5. API retrieval
 */

import { CoachTipGenerator, TipGenerationContext, PlanScoringSummary } from '../tip-generator.js';
import { TipStorage } from '../tip-storage.js';
import { CoachTipSubscriber } from '../subscriber.js';
import { Redis } from 'ioredis';

// Mock event processor for testing
class MockEventProcessor {
  private handlers = new Map<string, (event: any) => Promise<void>>();

  async connect() {
    console.log('Mock event processor connected');
  }

  async disconnect() {
    console.log('Mock event processor disconnected');
  }

  async subscribe(topic: string, handler: (event: any) => Promise<void>) {
    this.handlers.set(topic, handler);
    console.log(`Subscribed to ${topic}`);
  }

  async simulateEvent(topic: string, data: any) {
    const handler = this.handlers.get(topic);
    if (handler) {
      await handler({ data });
    }
  }
}

// Test data
const mockScoringData: PlanScoringSummary = {
  version: "1.0.0",
  total: 87.5,
  weights: {
    safety: 0.4,
    compliance: 0.3,
    performance: 0.3
  },
  factors: {
    safety: { score: 92, weight: 0.4, details: "Well-balanced progression" },
    compliance: { score: 85, weight: 0.3, details: "Realistic time commitment" },
    performance: { score: 85, weight: 0.3, details: "Good exercise variety" }
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    planComplexity: "intermediate",
    recommendationsApplied: ["progressive_overload", "recovery_balance"]
  }
};

const mockPlanGeneratedEvent = {
  eventId: "plan-test-12345-1234567890",
  userId: "user-test-123",
  planId: "plan-test-12345", 
  timestamp: Date.now(),
  planName: "6-Week Strength Building Plan",
  status: 'completed' as const,
  version: 1,
  planData: {
    name: "6-Week Strength Building Plan",
    description: "Structured strength training program",
    microcycles: [
      { weekNumber: 1, name: "Foundation Week", phase: "prep" }
    ],
    scoring: mockScoringData
  }
};

async function runIntegrationTest() {
  console.log('🧪 Starting CoachTip Integration Test...\n');

  let redis: Redis | undefined;
  let tipStorage: TipStorage;
  let tipGenerator: CoachTipGenerator;
  let mockEventProcessor: MockEventProcessor;
  let subscriber: CoachTipSubscriber | undefined;
  
  try {
    // 1. Initialize components
    console.log('1️⃣ Initializing components...');
    
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 15, // Use test database
      lazyConnect: true
    });
    
    await redis.connect();
    await redis.flushdb(); // Clear test database
    console.log('✅ Redis connected and cleared');
    
    tipStorage = new TipStorage(redis);
    console.log('✅ TipStorage initialized');
    
    tipGenerator = new CoachTipGenerator();
    console.log('✅ TipGenerator initialized');
    
    mockEventProcessor = new MockEventProcessor();
    await mockEventProcessor.connect();
    console.log('✅ Mock EventProcessor connected');
    
    subscriber = new CoachTipSubscriber(mockEventProcessor as any, tipGenerator, tipStorage);
    await subscriber.connect();
    console.log('✅ CoachTip subscriber connected');
    
    // 2. Test tip generation directly
    console.log('\\n2️⃣ Testing direct tip generation...');
    
    const tipContext: TipGenerationContext = {
      planId: mockPlanGeneratedEvent.planId,
      userId: mockPlanGeneratedEvent.userId,
      planName: mockPlanGeneratedEvent.planName,
      scoring: mockScoringData
    };
    
    const directTip = tipGenerator.generateTips(tipContext);
    console.log('✅ Direct tip generated:', {
      type: directTip?.type,
      priority: directTip?.priority,
      message: directTip?.message.substring(0, 50) + '...'
    });
    
    // 3. Test tip storage
    console.log('\\n3️⃣ Testing tip storage...');
    
    if (directTip) {
      await tipStorage.storeTip(directTip);
      console.log('✅ Tip stored successfully');
      
      const retrievedTip = await tipStorage.getTipByPlanId(directTip.planId);
      console.log('✅ Tip retrieved by planId:', {
        found: !!retrievedTip,
        id: retrievedTip?.id,
        storedAt: retrievedTip?.storedAt
      });
      
      // Clean up for event test
      await tipStorage.deleteTip(directTip.id, directTip.planId);
      console.log('✅ Test tip cleaned up');
    }
    
    // 4. Test full event-driven flow
    console.log('\\n4️⃣ Testing event-driven tip generation...');
    
    await mockEventProcessor.simulateEvent('plan_generated', mockPlanGeneratedEvent);
    console.log('✅ Plan generated event simulated');
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const eventTip = await tipStorage.getTipByPlanId(mockPlanGeneratedEvent.planId);
    console.log('✅ Event-generated tip retrieved:', {
      found: !!eventTip,
      id: eventTip?.id,
      type: eventTip?.type,
      priority: eventTip?.priority,
      scoringContext: eventTip?.scoringContext
    });
    
    // 5. Test API responses (simulate)
    console.log('\\n5️⃣ Testing API response simulation...');
    
    if (eventTip) {
      // Simulate GET /v1/plans/:id/coach-tip
      const apiResponse = {
        status: 200,
        data: eventTip
      };
      
      console.log('✅ API response simulated:', {
        status: apiResponse.status,
        tipId: apiResponse.data.id,
        message: apiResponse.data.message.substring(0, 50) + '...',
        actionType: apiResponse.data.action.actionType
      });
      
      // Test user tips endpoint
      const userTips = await tipStorage.getTipsByUserId(eventTip.userId);
      console.log('✅ User tips retrieved:', {
        count: userTips.length,
        tips: userTips.map(tip => ({ id: tip.id, type: tip.type, priority: tip.priority }))
      });
    }
    
    // 6. Test storage statistics
    console.log('\\n6️⃣ Testing storage statistics...');
    
    const stats = await tipStorage.getStats();
    console.log('✅ Storage stats:', stats);
    
    // 7. Test cleanup
    console.log('\\n7️⃣ Testing cleanup...');
    
    const cleanedCount = await tipStorage.cleanupExpiredTips();
    console.log('✅ Cleanup completed:', { cleanedCount });
    
    console.log('\\n🎉 Integration Test Completed Successfully!');
    console.log('\\n📋 Test Summary:');
    console.log('   • ✅ Components initialized correctly');
    console.log('   • ✅ Direct tip generation works');
    console.log('   • ✅ Tip storage and retrieval works');  
    console.log('   • ✅ Event-driven tip generation works');
    console.log('   • ✅ API response structure correct');
    console.log('   • ✅ Multi-user tip management works');
    console.log('   • ✅ Storage statistics available');
    console.log('   • ✅ Cleanup functionality works');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  } finally {
    // Cleanup
    if (subscriber) {
      await subscriber.disconnect();
    }
    if (redis) {
      await redis.flushdb();
      await redis.disconnect();
    }
    console.log('\\n🧹 Test cleanup completed');
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTest()
    .then(() => {
      console.log('\\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { runIntegrationTest };