# Stream 5 Implementation Plan

**Stream:** Movement Seeding & Backend Features  
**Status:** 🟢 In Progress  
**Last Updated:** 2025-10-15

## Overview

Stream 5 encompasses seeding the movement library and implementing three key backend features:
1. ✅ **Scoring System** - Plan quality scoring (complete)
2. ⏭️ **CoachTip Trigger** - Scoring-based coaching tips
3. ⏭️ **Weekly Review Integration** - Display plan quality insights

---

## Prerequisites & Dependencies

### Infrastructure

✅ **Movement Library Seeded**
- Local: Complete (8 foundational movements)
- Staging Emulator: Complete
- Real Staging: Pending Ops credentials

✅ **Scoring System Complete**
- Implementation: `src/scoring/fixed-weight.ts`
- Types: `src/types/scoring.ts`
- Tests: Unit + integration coverage
- Contract: `docs/contracts/SCORING_PAYLOAD_CONTRACT.md`
- Validator: `src/validation/scoring-validator.ts`
- CI Gate: `.github/workflows/validate-scoring-contract.yml`

### External Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Planning Engine API | ✅ Available | Plan generation endpoint |
| Event Bus (NATS) | ⏳ Configured | For plan-generated events |
| CoachTip Service | ⏳ Location TBD | May be in planning-engine or separate |
| Weekly Review API | ⏳ Location TBD | Frontend + backend location unknown |

---

## Feature 1: Scoring System ✅

**Status:** Complete and ready for rollout

### Implementation Summary

**Algorithm:** Fixed-weight scoring model
- Safety (60%): Intensity distribution, rest days, deload structure
- Compliance (30%): Deviation from user goals
- Performance (10%): Progression phases, intensity variety

**Integration Point:** `src/optimization/async-plan-generator.ts`
- Runs after candidate selection
- Attaches scoring to plan content
- Stores in `plan_jobs.result_data.scoring`
- Emits in `plan-generated` events

**Feature Flag:** `feature.v1_planning_scoring`
- LaunchDarkly integration
- Environment variable override: `FEATURE_V1_PLANNING_SCORING=true`

### Rollout Plan

See [`SCORING_ROLLOUT_GUIDE.md`](./SCORING_ROLLOUT_GUIDE.md) for detailed rollout instructions.

**Phases:**
1. ✅ Local Development - Enable via env var
2. ⏭️ Staging Emulator - Test with fresh DB
3. ⏳ Real Staging - When credentials available
4. ⏳ Production - Gradual rollout (1% → 25% → 100%)

### Testing

✅ **Unit Tests:** `src/__tests__/unit/fixed-weight-scoring.test.ts`
- All scoring factor logic
- Edge cases (empty plans, invalid input)
- Score calculations and contributions

✅ **Integration Tests:** `src/__tests__/integration/async-plan-generator.scoring.integration.test.ts`
- End-to-end plan generation with scoring
- Feature flag on/off scenarios
- Database persistence validation

✅ **Contract Validation:** `scripts/validate-scoring-contract.ts`
- Sample payload validation
- CI gate on scoring changes

---

## Feature 2: CoachTip Trigger ⏭️

**Status:** Planning

### Purpose

Generate personalized coaching tips based on plan quality scoring to help users understand their plan and improve adherence.

### Requirements

**When:** Immediately after plan generation (on `plan-generated` event)

**Input:**
- Plan scoring summary (`PlanScoringSummary`)
- User context (goals, experience, preferences)
- Plan structure (sessions, intensity distribution)

**Output:**
- CoachTip object with:
  - Tip text (actionable, specific)
  - Category (safety, compliance, performance)
  - Priority (high, medium, low)
  - Related plan factor(s)

### Design Options

#### Option A: Event-Driven (Recommended)

```typescript
// CoachTip service listens to plan-generated events
eventBus.subscribe('plan-generated', async (event) => {
  const { planData, userId } = event;
  const scoring = planData.scoring;
  
  if (!scoring) {
    // Generate basic tips without scoring
    return generateBasicTips(planData);
  }
  
  // Generate scoring-based tips
  const tips = generateTipsFromScoring(scoring, planData);
  await storeTips(userId, planData.id, tips);
  await notifyUser(userId, tips);
});
```

**Pros:**
- Decoupled from plan generation
- Async, non-blocking
- Easy to retry on failure
- Can be separate service

**Cons:**
- Requires event bus setup
- Potential latency before tips appear

#### Option B: Inline (Synchronous)

```typescript
// In async-plan-generator.ts after scoring
const tips = await generateCoachTips(scoringSummary, planData, request);
await this.storeCoachTips(jobId, tips);
```

**Pros:**
- Immediate availability
- Simpler to reason about
- Single transaction

**Cons:**
- Couples features together
- Blocks plan generation on tip generation
- Harder to maintain/test separately

**Recommendation:** Option A (event-driven) for better separation of concerns

### Implementation Steps

1. **Locate/Create CoachTip Service**
   - Search codebase for existing service
   - If none, create in `services/coach-tip` or `services/planning-engine/src/coach-tip`

2. **Implement Tip Generation Logic**
   ```typescript
   function generateTipsFromScoring(
     scoring: PlanScoringSummary,
     planData: TrainingPlan
   ): CoachTip[] {
     const tips: CoachTip[] = [];
     
     // Low safety score → safety tip
     if (scoring.factors.safety.score < 0.7) {
       tips.push({
         category: 'safety',
         priority: 'high',
         text: generateSafetyTip(scoring.factors.safety.reasons),
         relatedFactor: 'safety'
       });
     }
     
     // Poor compliance → adherence tip
     if (scoring.factors.compliance.score < 0.6) {
       tips.push({
         category: 'compliance',
         priority: 'high',
         text: generateComplianceTip(scoring.factors.compliance.metrics),
         relatedFactor: 'compliance'
       });
     }
     
     // Optimization opportunities
     if (scoring.factors.performance.score < 0.8) {
       tips.push({
         category: 'performance',
         priority: 'medium',
         text: generatePerformanceTip(scoring.factors.performance.reasons),
         relatedFactor: 'performance'
       });
     }
     
     return tips;
   }
   ```

3. **Wire Up Event Subscriber**
   - Subscribe to `plan-generated` events
   - Handle scoring absent case (fallback tips)
   - Store tips in database
   - Emit `coach-tip-generated` event for frontend

4. **Testing**
   - Unit tests for tip generation logic
   - Integration tests with scoring payloads
   - E2E tests: plan generation → tip delivery

5. **Rollout**
   - Enable locally with scoring feature flag
   - Deploy to staging emulator
   - Monitor tip quality and relevance
   - Gradual production rollout

### Tip Templates (Examples)

**Safety (Low Score):**
> "Your plan includes high-intensity sessions on consecutive days. Consider adding a rest day between intense workouts to reduce injury risk and improve recovery."

**Compliance (Low Score):**
> "This plan schedules 2.5 sessions per week, below your goal of 4 days. To meet your target, consider adding 1-2 shorter sessions or adjusting your availability."

**Performance (Medium Score):**
> "Your plan has solid progression over 12 weeks. Adding more intensity variety (like tempo work or power movements) could further enhance your gains."

### Schema

```typescript
interface CoachTip {
  id: string;
  userId: string;
  planId: string;
  category: 'safety' | 'compliance' | 'performance' | 'general';
  priority: 'high' | 'medium' | 'low';
  text: string;
  relatedFactor?: 'safety' | 'compliance' | 'performance';
  createdAt: string;
  dismissedAt?: string;
}
```

**Database Table:**
```sql
CREATE TABLE coach_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  plan_id UUID NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  related_factor VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  INDEX idx_coach_tips_user_id (user_id),
  INDEX idx_coach_tips_plan_id (plan_id)
);
```

---

## Feature 3: Weekly Review Integration ⏭️

**Status:** Planning

### Purpose

Display plan quality insights in the weekly review interface to help users understand their training week and make informed adjustments.

### Requirements

**When:** User accesses weekly review/summary page

**Input:**
- Current week's plan(s) with scoring
- Historical scores for comparison
- User progress metrics

**Output:**
- Quality score card with breakdown
- Trend visualization (if multiple weeks)
- Actionable insights or recommendations

### Design

#### Frontend Components

**Plan Quality Card:**
```tsx
interface PlanQualityCardProps {
  scoring: PlanScoringSummary;
  historicalScores?: PlanScoringSummary[];
}

function PlanQualityCard({ scoring, historicalScores }: PlanQualityCardProps) {
  if (!scoring) return null; // Hide card when scoring absent
  
  return (
    <Card>
      <h3>Plan Quality</h3>
      <ScoreGauge total={scoring.total} />
      
      <FactorBreakdown factors={scoring.factors} />
      
      {historicalScores && (
        <TrendChart scores={historicalScores} />
      )}
      
      <InsightsList scoring={scoring} />
    </Card>
  );
}
```

**Score Gauge:**
- Circular gauge showing total score (0-100)
- Color coded: Red (<70), Yellow (70-85), Green (85+)
- Label: "Excellent", "Good", "Needs Improvement"

**Factor Breakdown:**
```
Safety      ████████░░ 80%  (Weighted: 48%)
Compliance  ██████░░░░ 60%  (Weighted: 18%)
Performance ███████░░░ 70%  (Weighted: 7%)
                        ───────────────
                  Total: 73% (Good)
```

**Insights List:**
- Top 2-3 insights based on factor scores
- Link to CoachTips for detailed recommendations
- "What this means" explanations

#### Backend API

**Endpoint:** `GET /api/plans/:planId/quality`

**Response:**
```json
{
  "scoring": {
    "version": "fixed-weight-v1",
    "total": 0.73,
    "factors": { /* ... */ },
    "metadata": { /* ... */ }
  },
  "insights": [
    {
      "type": "safety",
      "message": "Rest days are well distributed",
      "sentiment": "positive"
    },
    {
      "type": "compliance",
      "message": "Plan schedules fewer sessions than your goal",
      "sentiment": "warning"
    }
  ],
  "trend": {
    "recentScores": [0.68, 0.71, 0.73],
    "direction": "improving"
  }
}
```

**Implementation:**
- Query `plan_jobs` table for `result_data.scoring`
- Fetch historical scores for trend
- Generate insights from factor scores/reasons
- Return formatted response

### Implementation Steps

1. **Locate Weekly Review Service**
   - Search for weekly review API/frontend
   - Identify where plan data is displayed

2. **Backend: Add Quality Endpoint**
   - Create `/api/plans/:planId/quality` endpoint
   - Query scoring from database
   - Calculate trends (if historical data available)
   - Generate insights based on factors

3. **Frontend: Plan Quality Card**
   - Create reusable component
   - Wire up to quality endpoint
   - Handle loading/error states
   - Hide card when scoring absent (backward compat)

4. **Frontend: Factor Breakdown**
   - Visual breakdown of factors
   - Show weighted contributions
   - Tooltips explaining factors

5. **Frontend: Trend Chart**
   - Line chart showing score over time
   - Optional: per-factor trends
   - Highlight improvements/regressions

6. **Testing**
   - Unit tests for insight generation
   - Component tests for UI
   - E2E tests for full flow
   - Visual regression tests

7. **Rollout**
   - Enable with scoring feature flag
   - Soft launch to beta users
   - Gather feedback on usefulness
   - Iterate on insights and presentation

### Analytics Events

Track user engagement with quality insights:
```typescript
// User views quality card
track('weekly_review.quality_card.viewed', {
  planId,
  totalScore: scoring.total,
  hasHistoricalData: !!trend
});

// User expands factor breakdown
track('weekly_review.quality_card.factor_expanded', {
  planId,
  factor: 'safety' | 'compliance' | 'performance'
});

// User clicks on insight
track('weekly_review.quality_card.insight_clicked', {
  planId,
  insightType: 'safety' | 'compliance' | 'performance'
});
```

---

## Cross-Feature Dependencies

```
Movement Seeding (✅)
       ↓
Scoring System (✅)
       ↓
       ├─→ CoachTip Trigger (⏭️)
       │        ↓
       │   CoachTip Storage & Delivery
       │
       └─→ Weekly Review Integration (⏭️)
                ↓
           Quality Insights Display
```

**Critical Path:**
1. Movement seeding must be complete before realistic plan generation
2. Scoring must be enabled before CoachTip or Weekly Review can consume it
3. CoachTip and Weekly Review can be developed in parallel

---

## Testing Strategy

### Unit Testing

✅ **Scoring Logic**
- All factor calculations
- Edge cases and invalid input
- Score aggregation

⏭️ **CoachTip Generation**
- Tip selection based on scores
- Template rendering
- Priority assignment

⏭️ **Insight Generation**
- Insight extraction from factors
- Sentiment classification
- Trend calculation

### Integration Testing

✅ **Plan Generation with Scoring**
- End-to-end scoring flow
- Database persistence
- Event emission

⏭️ **CoachTip Flow**
- Event subscription
- Tip storage
- User notification

⏭️ **Weekly Review Data Flow**
- API endpoint
- Historical data aggregation
- Frontend rendering

### E2E Testing

⏭️ **User Journey: Plan Generation → Tips → Review**
1. User generates plan
2. Scoring applied
3. CoachTip triggered
4. User views weekly review
5. Quality card displays
6. User interacts with insights

### Load Testing

⏳ **Performance Under Load**
- Concurrent plan generations with scoring
- CoachTip processing throughput
- Weekly review query performance

---

## Rollout Timeline

| Phase | Features | Duration | Status |
|-------|----------|----------|--------|
| **Phase 1: Foundation** | Movement seeding, Scoring system | Week 1-2 | ✅ Complete |
| **Phase 2: CoachTip** | Tip generation logic, Event integration | Week 3-4 | ⏭️ Next |
| **Phase 3: Weekly Review** | Quality card, API endpoint | Week 4-5 | ⏳ Planned |
| **Phase 4: Refinement** | Feedback iteration, Analytics | Week 6 | ⏳ Planned |
| **Phase 5: Production** | Gradual rollout to 100% | Week 7-8 | ⏳ Planned |

---

## Success Metrics

### Scoring System

- ✅ Contract validation passing in CI
- ✅ Unit test coverage > 90%
- ⏳ Integration test coverage > 80%
- ⏳ Zero scoring calculation errors in production

### CoachTip Trigger

- ⏳ Tips generated for > 95% of plans with scoring
- ⏳ Tip relevance score (user feedback) > 4.0/5.0
- ⏳ Tip dismissal rate < 30%
- ⏳ User engagement: > 60% click-through to tips

### Weekly Review Integration

- ⏳ Quality card displayed for > 95% of plans with scoring
- ⏳ User engagement: > 40% expand factor breakdown
- ⏳ Positive sentiment in user feedback
- ⏳ No performance regressions in page load time

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event bus not configured | High | Use inline CoachTip generation as fallback |
| CoachTip service location unknown | Medium | Search codebase, create if needed |
| Weekly Review API unclear | Medium | Collaborate with frontend team to locate |
| Tip quality/relevance low | High | A/B test templates, gather user feedback |
| Performance degradation | Medium | Add caching, optimize queries, monitor metrics |
| Feature flag coordination | Low | Use env overrides for local testing |

---

## Next Actions

### Immediate (Week 3)

1. ✅ Enable scoring locally: `$env:FEATURE_V1_PLANNING_SCORING="true"`
2. ✅ Validate scoring outputs with real plans
3. ⏭️ **Search codebase for CoachTip service location**
4. ⏭️ **Search codebase for Weekly Review API location**
5. ⏭️ Design CoachTip database schema
6. ⏭️ Draft CoachTip tip templates

### Short-Term (Week 4-5)

1. Implement CoachTip generation logic
2. Wire up event subscriber or inline integration
3. Test tip generation with scoring payloads
4. Create Weekly Review quality endpoint
5. Build frontend Plan Quality Card component
6. E2E testing for full flow

### Long-Term (Week 6+)

1. Gather user feedback on tips and insights
2. Iterate on templates and presentation
3. Add analytics tracking
4. Production rollout with monitoring
5. Remove feature flag after burn-in period

---

## References

- [Scoring Payload Contract](../../contracts/SCORING_PAYLOAD_CONTRACT.md)
- [Scoring Rollout Guide](./SCORING_ROLLOUT_GUIDE.md)
- [Movement Seeding Deployment Guide](./MOVEMENT_SEED_DEPLOYMENT.md)
- [Stream 5 Quick Start](./QUICK_START.md)

---

**Maintained by:** Stream 5 Team  
**Last Review:** 2025-10-15  
**Next Review:** 2025-10-22
