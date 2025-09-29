# Architecture-First Refactor Playbook

This document outlines the systematic approach to architectural refactoring in the Athlete Ally monorepo, emphasizing stability, reversibility, and incremental improvement.

## Core Principles

### 1. Architecture First
- **Stability over Speed**: Maintain system stability throughout refactoring
- **Reversible Changes**: Each change should be easily rollback-able
- **Incremental Progress**: Small, measurable improvements over large rewrites
- **Clear Gates**: Defined acceptance criteria for each phase

### 2. Risk Management
- **Non-blocking Changes**: Start with warnings, escalate to errors gradually
- **Exception Lists**: Document and track temporary violations
- **CI Integration**: Automated checks prevent regressions
- **Documentation**: Clear rationale for all architectural decisions

## Refactoring Phases

### Phase 0: Architecture Hygiene Pack
**Goal**: Clean up technical debt and establish guardrails

**Scope**:
- Remove large tracked artifacts and add guards
- Prevent sensitive files (.env) from being committed
- Consolidate duplicate configurations
- Add non-blocking architectural boundaries
- Create reusable CI components

**Acceptance Criteria**:
- ✅ CI green; Action Lint green
- ✅ Large file guard triggers on >1MB files
- ✅ .env guard prevents sensitive file commits
- ✅ No runtime behavior change
- ✅ All tests pass (Jest, Playwright)

**Deliverables**:
- Large file guard workflow
- Environment file guard workflow
- Consolidated Next.js configuration
- Jest ESM transition mapper
- ESLint boundary rules (warning level)
- Reusable sanity/lock discovery workflow
- Updated documentation

### Phase 1: Testing Architecture Unification ✅
**Goal**: Establish consistent testing framework and practices

**Scope**:
- Layered Jest configurations
- Playwright E2E setup (chromium-only, non-blocking)
- Vitest to Jest migration
- Test performance optimization

**Status**: ✅ **COMPLETED**

### Phase 2: Dependency Boundary Refactoring
**Goal**: Establish clear architectural boundaries and eliminate circular dependencies

**Scope**:
- Generate dependency graph analysis
- Enforce `apps → services → packages` direction
- ESLint rules: warn → error escalation
- Shared types consolidation
- Path alias standardization

**Acceptance Criteria**:
- ✅ Dependency graph shows clear unidirectional flow
- ✅ ESLint boundary rules at error level
- ✅ No circular dependencies
- ✅ Shared types in dedicated packages
- ✅ All imports use path aliases from tsconfig.base.json

### Phase 3: Performance and Optimization
**Goal**: Optimize build and test performance

**Scope**:
- Migrate Node/service tests from ts-jest to swc/babel
- Implement test parallelization
- Optimize CI cache strategies
- Bundle size optimization

### Phase 4: Observability and Monitoring
**Goal**: Establish consistent observability across all services

**Scope**:
- Unified OpenTelemetry setup
- Centralized health check contracts
- Performance monitoring
- Error tracking standardization

## Implementation Patterns

### 1. Guardrail Pattern
```yaml
# Example: Large file guard
- name: Check for large files
  run: |
    LARGE_FILES=$(find . -size +1M -type f)
    if [ -n "$LARGE_FILES" ]; then
      echo "❌ Large files detected"
      exit 1
    fi
```

### 2. Exception List Pattern
```json
{
  "exceptions": [
    {
      "rule": "no-restricted-imports",
      "pattern": "apps/** → services/**",
      "reason": "Temporary during migration",
      "expires": "2024-12-31"
    }
  ]
}
```

### 3. Gradual Escalation Pattern
```javascript
// ESLint rules progression
"no-restricted-imports": "warn",  // Phase 0: Non-blocking
"no-restricted-imports": "error", // Phase 2: Blocking
```

### 4. Reusable Component Pattern
```yaml
# Reusable workflow
name: Sanity Check (Reusable)
on:
  workflow_call:
    inputs:
      node_version:
        type: string
        default: '20'
```

## Quality Gates

### Pre-Refactor Checklist
- [ ] Current system is stable and tests pass
- [ ] Rollback plan is documented
- [ ] Impact assessment is complete
- [ ] Team is notified of changes

### Post-Refactor Checklist
- [ ] All tests pass (unit, integration, E2E)
- [ ] CI/CD pipeline is green
- [ ] Performance metrics are maintained
- [ ] Documentation is updated
- [ ] Team is trained on new patterns

### Emergency Rollback
```bash
# Single commit rollback
git revert <commit-hash>

# Full phase rollback
git revert <phase-start-commit>..<phase-end-commit>
```

## Tools and Automation

### Dependency Analysis
```bash
# Generate dependency graph
npx madge --image graph.svg src/

# Check for circular dependencies
npx madge --circular src/
```

### Boundary Enforcement
```javascript
// ESLint configuration
"no-restricted-imports": [
  "error",
  {
    "patterns": [
      {
        "group": ["services/**"],
        "message": "Use shared packages instead"
      }
    ]
  }
]
```

### CI Integration
```yaml
# Automated boundary checks
- name: Check architectural boundaries
  run: npm run lint:boundaries
```

## Success Metrics

### Phase 0 (Hygiene Pack)
- Large file incidents: 0
- Sensitive file commits: 0
- Configuration duplication: 0
- CI workflow duplication: <20%

### Phase 2 (Boundaries)
- Circular dependencies: 0
- Cross-layer violations: <5 (with exceptions)
- ESLint boundary errors: 0
- Shared type coverage: >90%

### Overall
- Build time: <10% increase
- Test execution time: <15% increase
- Developer onboarding time: <30% reduction
- Bug reports related to architecture: <5/month

## Lessons Learned

### What Works
- **Incremental approach**: Small, focused changes
- **Non-blocking start**: Warning level before error level
- **Exception documentation**: Clear rationale and expiration
- **Automated enforcement**: CI integration prevents regressions

### What to Avoid
- **Big bang refactoring**: Large, disruptive changes
- **Perfect from start**: Iterative improvement over perfection
- **Silent failures**: Always fail fast and loud
- **Undocumented exceptions**: Every exception needs clear reasoning

## Future Considerations

### Phase 5: Microservices Preparation
- Service boundary hardening
- API contract versioning
- Independent deployment capabilities

### Phase 6: Developer Experience
- Enhanced tooling and automation
- Improved debugging capabilities
- Streamlined development workflows

---

**Remember**: Architecture refactoring is a marathon, not a sprint. Focus on sustainable, incremental improvements that build a solid foundation for future development.
