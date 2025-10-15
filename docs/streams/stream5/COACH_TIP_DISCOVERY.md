# CoachTip Backend Discovery - Findings

**Date:** 2025-10-15  
**Status:** ❌ **NOT IMPLEMENTED**  
**Recommendation:** Implement using event-driven architecture

---

## Executive Summary

**Finding:** The CoachTip backend API endpoint does **not exist**. The frontend infrastructure is ready (types, API calls, UI components), but the backend service is missing.

**Recommendation:** Implement CoachTip service using event-driven architecture as outlined in the implementation plan. Subscribe to `plan-generated` events and generate tips based on scoring data.

---

## Discovery Results

### ✅ Frontend Infrastructure (Complete)

**Types Defined:**
- `packages/shared-types/src/coach-tip.ts` - Complete CoachTip type definitions
- Includes `scoringContext` field with safety/compliance/performance scores
- `CoachTipPayload`, `CoachTipAction`, `CoachTipTelemetry` all defined

**API Integration:**
- `apps/frontend/src/lib/coach-tip.ts`
- Expects: `GET /v1/plans/{planId}/coach-tip`
- Returns: `CoachTipPayload | null`
- Telemetry: `POST /v1/telemetry/coach-tip`

**UI Components:**
- `apps/frontend/src/components/coach-tip/CoachTipCard.tsx`
- `apps/frontend/src/components/coach-tip/CoachTipAdapter.tsx`
- Stream 3 has additional variants (A/B testing)

**Status:** ✅ **Ready to consume backend**

---

### ❌ Backend Implementation (Missing)

**Searched Locations:**
```
services/planning-engine/src/routes/
├── enhanced-plans.ts     ❌ No coach-tip endpoint
├── movement-curation.ts  ❌ No coach-tip endpoint
└── api-docs.ts          ❌ Not documented

services/planning-engine/src/
├── server.ts            ❌ No route registration
├── startup.ts           ❌ No route registration
└── handlers/            ❌ Directory doesn't exist

services/
├── ingest-service/      ❌ Not relevant
├── normalize-service/   ❌ Not relevant
└── coach-tip-service/   ❌ Does not exist
```

**Search Results:**
- Grep for "coach-tip": Only found in test file comment
- Grep for "/v1/plans/.*/coach-tip": No results
- Grep for "CoachTipPayload": No backend usage found
- Grep for "generateTip": No results

**Conclusion:** Backend endpoint is **not implemented**.

---

### ✅ Event Infrastructure (Ready)

**Event Bus:**
- `services/planning-engine/src/events/publisher.ts`
- Publishes `plan_generated` events after plan creation
- NATS-based event bus from `@athlete-ally/event-bus`

**Event Payload (Current):**
```typescript
const planGeneratedEvent = {
  eventId: `plan-${plan.id}-${Date.now()}`,
  userId: event.userId,
  planId: plan.id,
  timestamp: Date.now(),
  planName: plan.name || 'Generated Plan',
  status: 'completed',
  version: plan.version,
  // ❌ No scoring data currently included
};
```

**Event Subscribers:**
- `handleOnboardingCompleted` - Creates plans from onboarding
- `handlePlanGenerationRequested` - Async plan generation
- ❌ No `handlePlanGenerated` subscriber for CoachTip

**Status:** ✅ **Event bus ready for CoachTip subscriber**

---

### 🔍 Scoring Integration Point

**Current Scoring Implementation:**
- Location: `services/planning-engine/src/optimization/async-plan-generator.ts`
- Feature flag: `feature.v1_planning_scoring`
- Stores scoring in: `plan_jobs.result_data.scoring`
- Attaches to: `(planData as TrainingPlan).scoring`

**Event Publishing:**
```typescript
// Line 161-172 in server.ts
const planGeneratedEvent = {
  eventId: `plan-${plan.id}-${Date.now()}`,
  userId: event.userId,
  planId: plan.id,
  // ...
  // ❌ Missing: planData with scoring
};

await eventPublisher.publishPlanGenerated(planGeneratedEvent);
```

**Issue:** Scoring data is **not passed** to `plan_generated` event payload.

---

## Required Implementation

### ✅ Phase 1: Wire Scoring to Event (COMPLETED)

**File:** `services/planning-engine/src/server.ts` (line ~161)

**Changes Made:**
- ✅ Updated `planGeneratedEvent` payload to include `planData: plan.content`
- ✅ Updated `PlanGeneratedEvent` interface in contracts to include `planData?: any`
- ✅ Created verification script `scripts/verify-event-payload.ts`
- ✅ Verified that scoring data flows through event payload correctly

**Current Implementation:**
```typescript
const planGeneratedEvent: any = {
  eventId: `plan-${plan.id}-${Date.now()}`,
  userId: event.userId,
  planId: plan.id,
  timestamp: Date.now(),
  planName: plan.name || 'Generated Plan',
  status: 'completed',
  version: plan.version,
  planData: plan.content, // ✅ Now includes plan content with scoring
};
```

**Impact:** ✅ Events now include scoring data when available, enabling CoachTip generation.

---

### ✅ Phase 2: Create CoachTip Service (COMPLETED)

**Implementation Completed:** ✅ Event-driven CoachTip service

**Final Architecture:**
```
plan-generated event (NATS) + enriched planData
       ↓
CoachTip Subscriber (services/coach-tip-service)
       ↓
extractScoringData(planData.scoring)
       ↓
CoachTipGenerator.generateTips() → CoachTipPayload
       ↓
TipStorage.storeTip() → Redis
       ↓
API: GET /v1/plans/:id/coach-tip → Frontend
```

**Components Built:**
- ✅ `services/coach-tip-service/` - Complete standalone service
- ✅ `src/tip-generator.ts` - Scoring-aware tip generation logic
- ✅ `src/subscriber.ts` - Event subscriber for plan_generated events
- ✅ `src/tip-storage.ts` - Redis-based tip storage with TTL
- ✅ `src/routes/coach-tips.ts` - REST API endpoints
- ✅ `src/index.ts` - Service orchestration and lifecycle
- ✅ Integration tests verifying end-to-end flow

**Implementation Options:**

#### Option A: Separate CoachTip Service (Recommended)

**Pros:**
- Independent scaling
- Clear separation of concerns
- Can be deployed separately
- Easier to maintain/test

**Cons:**
- More infrastructure
- Additional service to monitor

**Structure:**
```
services/coach-tip-service/
├── src/
│   ├── index.ts                    # Service entry point
│   ├── subscriber.ts               # Subscribe to plan_generated
│   ├── tip-generator.ts            # Generate tips from scoring
│   ├── tip-storage.ts              # Store tips in database
│   ├── routes/
│   │   └── coach-tips.ts           # GET /v1/plans/:id/coach-tip
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma               # CoachTip database schema
└── package.json
```

#### Option B: Inline in Planning-Engine (Faster)

**Pros:**
- Faster to implement
- Shared database/infrastructure
- No new service deployment

**Cons:**
- Couples features
- Planning-engine becomes larger
- Harder to scale independently

**Structure:**
```
services/planning-engine/src/
├── coach-tip/
│   ├── subscriber.ts               # Subscribe to plan_generated
│   ├── generator.ts                # Generate tips from scoring
│   ├── storage.ts                  # Store tips
│   └── types.ts
└── routes/
    └── coach-tips.ts               # GET /v1/plans/:id/coach-tip
```

**Recommendation:** **Option A** (separate service) for long-term maintainability.

---

### Phase 3: Implement Tip Generation Logic

**Core Function:**
```typescript
function generateTipsFromScoring(
  scoring: PlanScoringSummary,
  planData: TrainingPlan,
  userId: string
): CoachTip[] {
  const tips: CoachTip[] = [];
  
  // Safety: score < 0.7 → high priority tip
  if (scoring.factors.safety.score < 0.7) {
    tips.push({
      tipId: generateId(),
      planId: planData.id,
      userId,
      surface: 'plan_summary',
      severity: 'critical',
      title: 'Safety Concern',
      message: 'Your plan may include high-intensity sessions without adequate recovery.',
      guidance: scoring.factors.safety.reasons[0],
      actions: [
        { action: 'accept', label: 'Adjust Plan', telemetryAction: 'coach_tip_accepted' },
        { action: 'dismiss', label: 'Keep Plan', telemetryAction: 'coach_tip_dismissed' }
      ],
      scoringContext: {
        safetyScore: scoring.factors.safety.score,
        complianceScore: scoring.factors.compliance.score,
        performanceScore: scoring.factors.performance.score,
        totalScore: scoring.total
      },
      createdAt: new Date().toISOString()
    });
  }
  
  // Compliance: score < 0.6 → warning tip
  if (scoring.factors.compliance.score < 0.6) {
    tips.push({
      tipId: generateId(),
      planId: planData.id,
      userId,
      surface: 'plan_summary',
      severity: 'warning',
      title: 'Plan Alignment',
      message: `Plan schedules ${scoring.factors.compliance.metrics.plannedWeeklySessions} sessions vs your goal of ${scoring.factors.compliance.metrics.weeklyGoalDays}.`,
      guidance: 'Consider adding 1-2 shorter sessions or adjusting your availability.',
      actions: [
        { action: 'accept', label: 'Adjust Goals', telemetryAction: 'coach_tip_accepted' },
        { action: 'dismiss', label: 'Keep As Is', telemetryAction: 'coach_tip_dismissed' }
      ],
      scoringContext: {
        safetyScore: scoring.factors.safety.score,
        complianceScore: scoring.factors.compliance.score,
        performanceScore: scoring.factors.performance.score,
        totalScore: scoring.total
      },
      createdAt: new Date().toISOString()
    });
  }
  
  // Performance: score < 0.8 → info tip
  if (scoring.factors.performance.score < 0.8) {
    tips.push({
      tipId: generateId(),
      planId: planData.id,
      userId,
      surface: 'plan_dashboard',
      severity: 'info',
      title: 'Optimization Opportunity',
      message: 'Your plan has solid progression over 12 weeks.',
      guidance: scoring.factors.performance.reasons[0],
      actions: [
        { action: 'accept', label: 'Learn More', telemetryAction: 'coach_tip_accepted' },
        { action: 'dismiss', label: 'Got It', telemetryAction: 'coach_tip_dismissed' }
      ],
      scoringContext: {
        safetyScore: scoring.factors.safety.score,
        complianceScore: scoring.factors.compliance.score,
        performanceScore: scoring.factors.performance.score,
        totalScore: scoring.total
      },
      createdAt: new Date().toISOString()
    });
  }
  
  return tips;
}
```

---

### Phase 4: Database Schema

**New Table:**
```sql
CREATE TABLE coach_tips (
  tip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  surface VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  guidance TEXT NOT NULL,
  actions JSONB NOT NULL,
  scoring_context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  INDEX idx_coach_tips_plan_id (plan_id),
  INDEX idx_coach_tips_user_id (user_id),
  INDEX idx_coach_tips_surface (surface),
  
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

**Prisma Schema:**
```prisma
model CoachTip {
  tipId           String   @id @default(uuid()) @map("tip_id")
  planId          String   @map("plan_id")
  userId          String   @map("user_id")
  surface         String
  severity        String
  title           String
  message         String
  guidance        String
  actions         Json
  scoringContext  Json?    @map("scoring_context")
  createdAt       DateTime @default(now()) @map("created_at")
  dismissedAt     DateTime? @map("dismissed_at")
  acceptedAt      DateTime? @map("accepted_at")
  
  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  @@index([planId], map: "idx_coach_tips_plan_id")
  @@index([userId], map: "idx_coach_tips_user_id")
  @@index([surface], map: "idx_coach_tips_surface")
  @@map("coach_tips")
}
```

---

### Phase 5: API Endpoint

**Route:** `GET /v1/plans/:planId/coach-tip`

**Response:**
```typescript
{
  tipId: string;
  planId: string;
  userId: string;
  surface: 'plan_summary' | 'plan_dashboard';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  guidance: string;
  actions: CoachTipAction[];
  scoringContext?: {
    safetyScore: number;
    complianceScore: number;
    performanceScore: number;
    totalScore: number;
  };
  createdAt: string;
}
```

**Implementation:**
```typescript
// services/coach-tip-service/src/routes/coach-tips.ts
fastify.get('/v1/plans/:planId/coach-tip', async (request, reply) => {
  const { planId } = request.params as { planId: string };
  const userId = request.user?.userId; // From auth middleware
  
  // Get most recent tip for this plan
  const tip = await prisma.coachTip.findFirst({
    where: {
      planId,
      userId,
      dismissedAt: null, // Only show non-dismissed tips
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  if (!tip) {
    return reply.code(200).send(null);
  }
  
  return reply.code(200).send({
    tipId: tip.tipId,
    planId: tip.planId,
    userId: tip.userId,
    surface: tip.surface,
    severity: tip.severity,
    title: tip.title,
    message: tip.message,
    guidance: tip.guidance,
    actions: tip.actions,
    scoringContext: tip.scoringContext,
    createdAt: tip.createdAt.toISOString()
  });
});

// POST /v1/plans/:planId/coach-tip/dismiss
fastify.post('/v1/plans/:planId/coach-tip/dismiss', async (request, reply) => {
  const { planId } = request.params as { planId: string };
  const { tipId } = request.body as { tipId: string };
  
  await prisma.coachTip.update({
    where: { tipId },
    data: { dismissedAt: new Date() }
  });
  
  return reply.code(200).send({ success: true });
});
```

---

## Implementation Timeline

### Immediate (This PR)
- ✅ Scoring validator and documentation (complete)
- ⏭️ Wire scoring to `plan_generated` events

### Week 3-4 (Next PR)
- Create CoachTip service structure
- Implement event subscriber
- Implement tip generation logic
- Add database schema
- Create API endpoints
- Write tests

### Week 4-5 (Parallel with Weekly Review)
- Deploy CoachTip service to staging
- Test with real scoring data
- Gather internal feedback
- Iterate on tip quality

---

## Decision Required

**Question:** Should we implement CoachTip in:
1. **Separate service** (recommended) - Better long-term, more setup
2. **Planning-engine inline** (faster) - Quicker but couples features

**Recommendation:** **Separate service** for maintainability, but we can start with inline for MVP and refactor later if needed.

---

## Next Actions

1. ✅ Document findings (this file)
2. ⏭️ Decide on architecture (separate vs inline)
3. ⏭️ Wire scoring to events (immediate fix)
4. ⏭️ Create CoachTip service skeleton
5. ⏭️ Implement tip generation logic
6. ⏭️ Add database schema
7. ⏭️ Create API endpoints
8. ⏭️ Test end-to-end with scoring flag enabled

---

**Prepared by:** Stream 5 Team  
**Status:** Ready for implementation decision  
**Blocker:** Architecture decision required
