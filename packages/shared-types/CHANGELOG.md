# CHANGELOG - @athlete-ally/shared-types

## [2.0.0] - 2025-06-01 (Planned)

### BREAKING CHANGES
- **Removed**: Legacy mapping functions (`mapLegacyFatigueLevel`, `mapLegacySeason`, `mapLegacyApiRequest`, `mapLegacyApiResponse`)
- **Removed**: Support for deprecated values:
  - `'normal'` fatigue level (use `'moderate'` instead)
  - `'off-season'`, `'pre-season'`, `'in-season'` season formats (use `'offseason'`, `'preseason'`, `'inseason'`)

### Migration Guide
1. Update all fatigue level references from `'normal'` to `'moderate'`
2. Update all season references from hyphenated to non-hyphenated formats
3. Remove any usage of legacy mapping functions
4. Update API clients to use canonical formats

**📖 For detailed migration guidance, see the [Contract Backward Compatibility Runbook](../../docs/contract-backward-compatibility-runbook.md)**

## [1.1.0] - 2025-01-05

### Added
- **New**: Comprehensive contract type system
- **New**: Zod runtime validation schemas
- **New**: Backward compatibility mappings for legacy clients
- **New**: Contract drift detection utilities
- **New**: Comprehensive documentation

### Features
- **FatigueLevel**: Canonical type `'low' | 'moderate' | 'high'`
- **Season**: Canonical type `'offseason' | 'preseason' | 'inseason'`
- **FeedbackType**: Canonical type `'bug' | 'feature' | 'improvement' | 'general'`
- **Runtime Validation**: Zod schemas for API request/response validation
- **Legacy Support**: Temporary mappings for deprecated formats

### Breaking Changes
- **Changed**: Fatigue level `'normal'` → `'moderate'` (with backward compatibility)
- **Changed**: Season formats `'off-season'` → `'offseason'` (with backward compatibility)

### Deprecated
- `'normal'` fatigue level (use `'moderate'` instead)
- `'off-season'`, `'pre-season'`, `'in-season'` season formats
- Legacy mapping functions (will be removed in v2.0.0)

## [1.0.0] - 2024-12-01

### Initial Release
- Basic shared types for Athlete Ally project
- Core domain types (Exercise, WorkoutExercise, etc.)
- Onboarding data structures
