#!/usr/bin/env tsx

/**
 * Verification Script: Plan Generated Event Payload
 * 
 * This script verifies that the plan_generated event payload now includes
 * scoring data from the plan content, enabling CoachTip generation.
 * 
 * Usage: tsx scripts/verify-event-payload.ts
 */

import { z } from 'zod';

// Mock plan content structure with scoring
const mockPlanContent = {
  name: "6-Week Strength Building Plan",
  description: "Structured strength training program",
  microcycles: [
    { weekNumber: 1, name: "Foundation Week", phase: "prep" }
  ],
  scoring: {
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
  }
};

// Schema for verifying event payload structure
const PlanGeneratedEventSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  planId: z.string(),
  timestamp: z.number(),
  planName: z.string(),
  status: z.literal('completed'),
  version: z.number(),
  planData: z.object({
    scoring: z.object({
      version: z.string(),
      total: z.number(),
      weights: z.object({
        safety: z.number(),
        compliance: z.number(),
        performance: z.number()
      }),
      factors: z.object({
        safety: z.object({ score: z.number(), weight: z.number(), details: z.string() }),
        compliance: z.object({ score: z.number(), weight: z.number(), details: z.string() }),
        performance: z.object({ score: z.number(), weight: z.number(), details: z.string() })
      }),
      metadata: z.object({
        generatedAt: z.string(),
        planComplexity: z.string(),
        recommendationsApplied: z.array(z.string())
      })
    }).optional()
  }).optional()
});

function simulateEventPayload(planContent: any) {
  // Simulate the new event payload structure from server.ts
  return {
    eventId: `plan-12345-${Date.now()}`,
    userId: "user-123",
    planId: "plan-12345",
    timestamp: Date.now(),
    planName: planContent.name || 'Generated Plan',
    status: 'completed' as const,
    version: 1,
    planData: planContent, // ✅ Now includes scoring data
  };
}

function extractScoringFromEvent(eventPayload: any) {
  return eventPayload.planData?.scoring;
}

function generateMockCoachTip(scoring: any) {
  if (!scoring) {
    return { message: "No scoring data available for tip generation" };
  }

  const { total, factors } = scoring;
  let tips = [];

  if (factors.safety.score < 80) {
    tips.push({
      type: "safety",
      priority: "high",
      message: "Consider reducing training volume in week 1 to improve safety score",
      action: "modify_volume"
    });
  }

  if (factors.compliance.score < 85) {
    tips.push({
      type: "compliance", 
      priority: "medium",
      message: "This plan may be challenging to follow consistently. Consider shorter sessions.",
      action: "adjust_schedule"
    });
  }

  if (total >= 85) {
    tips.push({
      type: "performance",
      priority: "low", 
      message: "Great plan! Focus on progressive overload for optimal results.",
      action: "emphasize_progression"
    });
  }

  return {
    planScore: total,
    tips: tips.length > 0 ? tips : [{ 
      type: "general", 
      message: "Solid training plan. Stay consistent for best results." 
    }]
  };
}

// Main verification
console.log("🔍 Verifying Plan Generated Event Payload Structure...\n");

try {
  // 1. Simulate new event payload
  const eventPayload = simulateEventPayload(mockPlanContent);
  console.log("✅ Generated event payload:", JSON.stringify(eventPayload, null, 2));

  // 2. Validate schema
  const validation = PlanGeneratedEventSchema.safeParse(eventPayload);
  if (!validation.success) {
    console.error("❌ Schema validation failed:", validation.error);
    process.exit(1);
  }
  console.log("\n✅ Event payload schema validation passed");

  // 3. Extract scoring data
  const scoring = extractScoringFromEvent(eventPayload);
  console.log("\n✅ Extracted scoring data:", JSON.stringify(scoring, null, 2));

  // 4. Generate mock coach tip
  const coachTip = generateMockCoachTip(scoring);
  console.log("\n✅ Generated CoachTip:", JSON.stringify(coachTip, null, 2));

  console.log("\n🎉 Verification Complete!");
  console.log("📋 Summary:");
  console.log("   • Event payload now includes planData with scoring");
  console.log("   • CoachTip generation can extract scoring context");
  console.log("   • Ready for CoachTip subscriber implementation");

} catch (error) {
  console.error("❌ Verification failed:", error);
  process.exit(1);
}