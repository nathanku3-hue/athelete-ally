# Scoring Payload Contract v1

**Version:** `fixed-weight-v1`  
**Status:** Stable  
**Consumer Services:** CoachTip Backend, Weekly Review/DX, Ops Analytics

## Overview

This document defines the contract for the scoring payload included in plan generation results when `feature.v1_planning_scoring` is enabled. This payload is added to:

1. `planJob.resultData.scoring` - PlanJob database record
2. `plan.content.scoring` - Stored plan JSON
3. `plan-generated` event payload

## TypeScript Definition

```typescript
export interface PlanScoringSummary {
  version: string;                    // Scoring algorithm version
  total: number;                      // Final weighted score (0-1)
  weights: {
    safety: number;                   // Weight for safety factor
    compliance: number;               // Weight for compliance factor
    performance: number;              // Weight for performance factor
  };
  factors: {
    safety: PlanScoringFactorDetail;
    compliance: PlanScoringFactorDetail;
    performance: PlanScoringFactorDetail;
  };
  metadata: {
    evaluatedAt: string;              // ISO 8601 timestamp
    weeklySessionsPlanned: number;    // Average sessions per week
    weeklyGoalDays?: number;          // User's target days
    requestContext?: {
      availabilityDays?: number;
      weeklyGoalDays?: number;
    };
  };
}

export interface PlanScoringFactorDetail {
  weight: number;                     // Factor weight (0-1)
  score: number;                      // Factor score (0-1)
  contribution: number;               // Weighted contribution to total
  reasons: string[];                  // Human-readable explanations
  metrics: Record<string, number>;    // Factor-specific metrics
}
```

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PlanScoringSummary",
  "type": "object",
  "required": ["version", "total", "weights", "factors", "metadata"],
  "properties": {
    "version": {
      "type": "string",
      "enum": ["fixed-weight-v1"]
    },
    "total": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "weights": {
      "type": "object",
      "required": ["safety", "compliance", "performance"],
      "properties": {
        "safety": { "type": "number", "minimum": 0, "maximum": 1 },
        "compliance": { "type": "number", "minimum": 0, "maximum": 1 },
        "performance": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "factors": {
      "type": "object",
      "required": ["safety", "compliance", "performance"],
      "properties": {
        "safety": { "$ref": "#/definitions/factorDetail" },
        "compliance": { "$ref": "#/definitions/factorDetail" },
        "performance": { "$ref": "#/definitions/factorDetail" }
      }
    },
    "metadata": {
      "type": "object",
      "required": ["evaluatedAt", "weeklySessionsPlanned"],
      "properties": {
        "evaluatedAt": { "type": "string", "format": "date-time" },
        "weeklySessionsPlanned": { "type": "number", "minimum": 0 },
        "weeklyGoalDays": { "type": "number", "minimum": 0 },
        "requestContext": {
          "type": "object",
          "properties": {
            "availabilityDays": { "type": "number" },
            "weeklyGoalDays": { "type": "number" }
          }
        }
      }
    }
  },
  "definitions": {
    "factorDetail": {
      "type": "object",
      "required": ["weight", "score", "contribution", "reasons", "metrics"],
      "properties": {
        "weight": { "type": "number", "minimum": 0, "maximum": 1 },
        "score": { "type": "number", "minimum": 0, "maximum": 1 },
        "contribution": { "type": "number", "minimum": 0, "maximum": 1 },
        "reasons": {
          "type": "array",
          "items": { "type": "string" }
        },
        "metrics": {
          "type": "object",
          "additionalProperties": { "type": "number" }
        }
      }
    }
  }
}
```

## Example Payload

```json
{
  "version": "fixed-weight-v1",
  "total": 0.8906,
  "weights": {
    "safety": 0.6,
    "compliance": 0.3,
    "performance": 0.1
  },
  "factors": {
    "safety": {
      "score": 1,
      "weight": 0.6,
      "contribution": 0.6,
      "reasons": [
        "Intensity distribution remains within safe thresholds",
        "Rest days allocated (2.0 per week)",
        "Deload structure present in 1 microcycle(s)"
      ],
      "metrics": {
        "deloadWeeks": 1,
        "totalSessions": 5,
        "averageRestDays": 2,
        "highIntensityRatio": 0.2
      }
    },
    "compliance": {
      "score": 0.7188,
      "weight": 0.3,
      "contribution": 0.2156,
      "reasons": [
        "Plan schedules 2.5 sessions versus target 4"
      ],
      "metrics": {
        "deviation": 1.5,
        "weeklyGoalDays": 4,
        "availabilityDays": 4,
        "plannedWeeklySessions": 2.5
      }
    },
    "performance": {
      "score": 0.75,
      "weight": 0.1,
      "contribution": 0.075,
      "reasons": [
        "Progression phases detected (2) supporting long-term gains",
        "Intensity variety ensures balanced stimulus across the block",
        "Program duration supports sustained progression",
        "Microcycle structure present with defined sessions"
      ],
      "metrics": {
        "durationWeeks": 12,
        "intensityVariety": 3,
        "progressionPhases": 2
      }
    }
  },
  "metadata": {
    "evaluatedAt": "2025-10-15T07:15:00.000Z",
    "weeklySessionsPlanned": 2.5,
    "weeklyGoalDays": 4,
    "requestContext": {
      "availabilityDays": 4,
      "weeklyGoalDays": 4
    }
  }
}
```

## Consumer Integration Guide

### CoachTip Backend

**Use Case:** Generate coaching insights based on plan quality

```typescript
// Access scoring from plan-generated event
function handlePlanGenerated(event: PlanGeneratedEvent) {
  const scoring = event.planData.scoring;
  
  if (!scoring) {
    // Fallback: scoring not available (flag off)
    return generateBasicCoachTip(event.planData);
  }
  
  // Use scoring to tailor coaching
  if (scoring.total < 0.7) {
    return generateImprovementTip(scoring);
  } else if (scoring.factors.safety.score < 0.8) {
    return generateSafetyTip(scoring.factors.safety);
  } else if (scoring.factors.compliance.score < 0.8) {
    return generateComplianceTip(scoring.factors.compliance);
  }
  
  return generatePositiveTip(scoring);
}
```

### Weekly Review/DX

**Use Case:** Display plan quality metrics to users

```typescript
// Access scoring from stored plan
function renderPlanQualityCard(plan: Plan) {
  const scoring = plan.content?.scoring;
  
  if (!scoring) {
    return null; // Don't show card if scoring unavailable
  }
  
  return (
    <QualityCard
      overallScore={scoring.total}
      factors={[
        { name: 'Safety', score: scoring.factors.safety.score },
        { name: 'Compliance', score: scoring.factors.compliance.score },
        { name: 'Performance', score: scoring.factors.performance.score },
      ]}
    />
  );
}
```

### Ops Analytics

**Use Case:** Track plan quality metrics over time

```sql
-- Query scoring data from planJob.resultData
SELECT 
  pj.job_id,
  pj.user_id,
  pj.created_at,
  pj.result_data->>'scoring' as scoring_json,
  (pj.result_data->'scoring'->>'total')::float as total_score,
  (pj.result_data->'scoring'->'factors'->'safety'->>'score')::float as safety_score,
  (pj.result_data->'scoring'->'factors'->'compliance'->>'score')::float as compliance_score,
  (pj.result_data->'scoring'->'factors'->'performance'->>'score')::float as performance_score
FROM plan_jobs pj
WHERE pj.result_data ? 'scoring'
  AND pj.status = 'completed'
ORDER BY pj.created_at DESC;
```

## Scoring Algorithm Details

### Weights (v1)
- **Safety:** 0.6 (60%) - Prevents overtraining/injury
- **Compliance:** 0.3 (30%) - Matches user goals
- **Performance:** 0.1 (10%) - Supports adaptation

### Safety Factor
- Penalizes high-intensity ratio >40%
- Rewards adequate rest days (≥2/week)
- Rewards deload weeks
- **Metrics:** `totalSessions`, `highIntensityRatio`, `averageRestDays`, `deloadWeeks`

### Compliance Factor
- Measures deviation from target sessions/week
- Penalizes plans with zero sessions
- **Metrics:** `plannedWeeklySessions`, `weeklyGoalDays`, `availabilityDays`, `deviation`

### Performance Factor
- Rewards progression phases
- Rewards intensity variety (3+ levels)
- Rewards sufficient duration (≥12 weeks)
- Requires microcycle structure
- **Metrics:** `progressionPhases`, `intensityVariety`, `durationWeeks`

## Backward Compatibility

### When Flag is OFF
- `scoring` field will be **absent** from all payloads
- Consumers MUST handle `null`/`undefined` scoring gracefully
- Fallback to basic logic without scoring insights

### Future Versions
- `version` field enables algorithm evolution
- Consumers should check `version` and handle accordingly:
  ```typescript
  if (scoring.version === 'fixed-weight-v1') {
    // Use v1 logic
  } else if (scoring.version === 'fixed-weight-v2') {
    // Use v2 logic
  } else {
    // Unknown version, fallback
  }
  ```

## Validation

### Required Fields
All top-level fields are required when scoring is present. Consumers should validate:

```typescript
function isValidScoring(scoring: unknown): scoring is PlanScoringSummary {
  if (!scoring || typeof scoring !== 'object') return false;
  const s = scoring as any;
  
  return (
    typeof s.version === 'string' &&
    typeof s.total === 'number' &&
    s.total >= 0 && s.total <= 1 &&
    s.weights && s.factors && s.metadata
  );
}
```

### Acceptable Ranges
- `total`: 0.0 - 1.0
- Factor `score`: 0.0 - 1.0
- Factor `contribution`: 0.0 - 1.0
- `weeklySessionsPlanned`: 0+

## Support

### Questions
- **Implementation:** Check `services/planning-engine/src/scoring/fixed-weight.ts`
- **Types:** Check `services/planning-engine/src/types/scoring.ts`
- **Tests:** Check `services/planning-engine/src/__tests__/unit/fixed-weight-scoring.test.ts`

### Changes
- New versions will update this contract document
- Breaking changes will increment version (e.g., `fixed-weight-v2`)
- Additive changes may not increment version

### Feature Flag
- **Flag:** `feature.v1_planning_scoring`
- **Provider:** LaunchDarkly
- **Status:** Behind flag (pending stakeholder approval)
- **Rollout:** TBD

---

**Last Updated:** October 15, 2025  
**Contract Version:** 1.0  
**Algorithm Version:** `fixed-weight-v1`
