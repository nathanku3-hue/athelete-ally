# Contract Backward Compatibility Runbook

## 🎯 Overview

This runbook provides guidance for managing backward compatibility (BC) mappings in the Athlete Ally contract type system. It covers monitoring, configuration, and deprecation timelines.

## 📊 Environment Variables

### Core Configuration
- `CONTRACT_V1_COMPAT`: Controls BC mapping behavior
  - `on` (default): Enable all legacy mappings
  - `off`: Disable all legacy mappings (strict mode)
  - `strict`: Enable mappings but log warnings
- `CONTRACT_TELEMETRY`: Enable/disable telemetry collection
  - `true` (default): Collect legacy mapping metrics
  - `false`: Disable telemetry
- `CONTRACT_STRICT_THRESHOLD`: Days after which to enforce strict mode (default: 90)

### Example Configurations

#### Development Environment
```bash
CONTRACT_V1_COMPAT=on
CONTRACT_TELEMETRY=true
NODE_ENV=development
```

#### Staging Environment
```bash
CONTRACT_V1_COMPAT=strict
CONTRACT_TELEMETRY=true
NODE_ENV=staging
```

#### Production Environment
```bash
CONTRACT_V1_COMPAT=on
CONTRACT_TELEMETRY=true
NODE_ENV=production
```

## 📈 Monitoring Legacy Usage

### Telemetry Metrics

The system tracks legacy mapping usage with the following metrics:

- `contract_legacy_mapping_total{field="fatigue_level",value="normal"}`
- `contract_legacy_mapping_total{field="season",value="off-season"}`
- `contract_legacy_mapping_total{field="season",value="pre-season"}`
- `contract_legacy_mapping_total{field="season",value="in-season"}`

### Monitoring Dashboard Queries

#### Prometheus/Grafana
```promql
# Total legacy mappings in last 24h
sum(increase(contract_legacy_mapping_total[24h]))

# Legacy mappings by field
sum by (field) (increase(contract_legacy_mapping_total[24h]))

# Legacy mappings by environment
sum by (environment) (increase(contract_legacy_mapping_total[24h]))
```

#### Alert Rules
```yaml
# Alert if legacy usage is high
- alert: HighLegacyMappingUsage
  expr: sum(increase(contract_legacy_mapping_total[1h])) > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High legacy mapping usage detected"
    description: "{{ $value }} legacy mappings in the last hour"

# Alert if legacy usage persists after deprecation date
- alert: LegacyMappingAfterDeprecation
  expr: sum(increase(contract_legacy_mapping_total[24h])) > 0
  for: 0m
  labels:
    severity: critical
  annotations:
    summary: "Legacy mappings still in use after deprecation"
    description: "Legacy mappings detected after deprecation deadline"
```

## 🗓️ Deprecation Timeline

### Phase 1: Monitoring (Current)
- **Duration**: 0-30 days
- **Action**: Enable telemetry, monitor usage patterns
- **CONTRACT_V1_COMPAT**: `on`
- **Goal**: Understand legacy usage patterns

### Phase 2: Warning (30-60 days)
- **Duration**: 30-60 days
- **Action**: Increase warning frequency, notify teams
- **CONTRACT_V1_COMPAT**: `strict`
- **Goal**: Encourage migration to canonical formats

### Phase 3: Preparation (60-90 days)
- **Duration**: 60-90 days
- **Action**: Prepare migration tools, finalize v2.0.0
- **CONTRACT_V1_COMPAT**: `strict`
- **Goal**: Ensure all clients are ready for migration

### Phase 4: Cutover (90+ days)
- **Duration**: 90+ days
- **Action**: Deploy v2.0.0, disable legacy mappings
- **CONTRACT_V1_COMPAT**: `off`
- **Goal**: Complete migration to canonical formats

## 🔧 Migration Tools

### Data Migration Script
```typescript
// Example data migration script
import { mapLegacyFatigueLevel, mapLegacySeason } from '@athlete-ally/shared-types';

async function migrateUserData() {
  const users = await db.users.findMany();
  
  for (const user of users) {
    const updates: any = {};
    
    // Migrate fatigue levels
    if (user.fatigueLevel === 'normal') {
      updates.fatigueLevel = 'moderate';
    }
    
    // Migrate seasons
    if (['off-season', 'pre-season', 'in-season'].includes(user.season)) {
      updates.season = mapLegacySeason(user.season);
    }
    
    if (Object.keys(updates).length > 0) {
      await db.users.update({
        where: { id: user.id },
        data: updates
      });
    }
  }
}
```

### Client Migration Guide
```typescript
// Before (legacy)
const fatigueLevel = 'normal';
const season = 'off-season';

// After (canonical)
const fatigueLevel = 'moderate';
const season = 'offseason';
```

## 🚨 Emergency Procedures

### Emergency Bypass
If contract checks are blocking critical deployments:

1. Add `allowcontractdrift` label to PR
2. Document the bypass reason
3. Create follow-up issue to address the drift
4. Remove label after fixing the issue

### Rollback Procedure
If legacy mappings cause issues:

1. Set `CONTRACT_V1_COMPAT=off` in environment
2. Deploy immediately
3. Investigate root cause
4. Re-enable mappings with fixes

## 📋 Checklist

### Pre-Deprecation (0-30 days)
- [ ] Enable telemetry in all environments
- [ ] Set up monitoring dashboards
- [ ] Document current legacy usage patterns
- [ ] Notify all teams about deprecation timeline

### Warning Phase (30-60 days)
- [ ] Switch to `CONTRACT_V1_COMPAT=strict`
- [ ] Increase warning frequency
- [ ] Send team notifications
- [ ] Track migration progress

### Preparation Phase (60-90 days)
- [ ] Create migration tools
- [ ] Test v2.0.0 in staging
- [ ] Prepare rollback procedures
- [ ] Finalize migration documentation

### Cutover Phase (90+ days)
- [ ] Deploy v2.0.0
- [ ] Set `CONTRACT_V1_COMPAT=off`
- [ ] Monitor for issues
- [ ] Remove legacy mapping code

## 🔗 Related Documentation

- [Contract Types Specification](./contract-types-specification.md)
- [CHANGELOG](../packages/shared-types/CHANGELOG.md)
- [Contract Check CI Workflow](../.github/workflows/contract-check.yml)
- [Drift Detection Script](../scripts/detect-contract-drift.js)

## 📞 Support

For questions about contract backward compatibility:
- Create an issue in the repository
- Contact the platform team
- Check the monitoring dashboards for current status
