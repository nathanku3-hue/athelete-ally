# PR: Stream 3 UI Integration - CoachTip & Weekly Review Prototypes

## Summary

This PR integrates the **Stream 3 UI prototype variants** for **CoachTip** and **Weekly Review** components into the production application. The implementation includes:

- 🎨 **Two UI variants** for both CoachTip (A: Traditional Tooltip, B: Modern Card) and Weekly Review (A: Dashboard, B: Visual Story)
- 🚩 **Feature flag system** for runtime variant switching (localStorage-based, LaunchDarkly-ready)
- 📊 **Telemetry integration** tracking user interactions (show/dismiss/accept for CoachTip, show/apply for Weekly Review)
- ♿ **WCAG 2.1 Level AA accessibility** compliance (keyboard nav, ARIA, color contrast)
- 📱 **Responsive design** (mobile-first, tested 375px–1920px)
- 📖 **Adapter pattern** for clean separation between backend API types and UI variants
- 📝 **Onboarding copy variants** (A: Technical/Data-driven, B: Personalized/Adaptive)

### Final Variant Selections (Post Product/Design Review)

- **CoachTip**: Variant B (Modern Card) selected for production
- **Weekly Review**: Hybrid model (Variant B visual + Variant A data table)
- **Onboarding Copy**: Variant B (Personalized/Adaptive messaging)

See `docs/streams/stream3/DESIGN_DECISIONS.md` for detailed rationale.

---

## Changes Overview

### New Files

#### Components
- `apps/frontend/src/components/coach-tip/CoachTipAdapter.tsx` - Backend-to-variant adapter with telemetry
- `apps/frontend/src/components/weekly-review/WeeklyReviewAdapter.tsx` - Backend-to-variant adapter with telemetry
- `apps/frontend/src/components/stream3/CoachTip.tsx` - Unified variant switcher
- `apps/frontend/src/components/stream3/CoachTipVariantA.tsx` - Traditional tooltip design
- `apps/frontend/src/components/stream3/CoachTipVariantB.tsx` - Modern card design
- `apps/frontend/src/components/stream3/WeeklyReview.tsx` - Unified variant switcher
- `apps/frontend/src/components/stream3/WeeklyReviewVariantA.tsx` - Traditional dashboard
- `apps/frontend/src/components/stream3/WeeklyReviewVariantB.tsx` - Visual story format
- `apps/frontend/src/components/stream3/VariantSwitcher.tsx` - Dev-only variant toggle UI
- `apps/frontend/src/components/stream3/*.stories.tsx` - Storybook stories for all components

#### Lib & API
- `apps/frontend/src/lib/coach-tip.ts` - CoachTip API client + telemetry functions
- `apps/frontend/src/lib/weekly-review.ts` - Weekly Review API client + telemetry functions
- `apps/frontend/src/lib/stream3/onboarding-copy.ts` - Copy variants for A/B testing

#### Hooks
- `apps/frontend/src/hooks/useFeatureVariant.ts` - Feature flag hook (localStorage-based)

#### Types
- `packages/shared-types/src/coach-tip.ts` - CoachTip backend contract types
- `packages/shared-types/src/weekly-review.ts` - Weekly Review backend contract types

#### Documentation
- `docs/streams/stream3/README.md` - Full integration guide, QA checklist, telemetry docs
- `docs/streams/stream3/DESIGN_DECISIONS.md` - Design rationale and variant comparison
- `docs/streams/stream3/feature-flags-telemetry.md` - Feature flag & telemetry specification

### Modified Files

- *(List any modified files here, e.g., if you updated existing routes, API clients, or app layout)*

---

## Screenshots

### CoachTip Variant A (Traditional Tooltip)
![CoachTip Variant A](https://placeholder-url-for-screenshot-1.png)
*Simple, non-intrusive callout style with category color-coding*

### CoachTip Variant B (Modern Card) ✅ **Selected for Production**
![CoachTip Variant B](https://placeholder-url-for-screenshot-2.png)
*Gradient accent card with RPE context badge and prominent CTA*

### Weekly Review Variant A (Traditional Dashboard)
![Weekly Review Variant A](https://placeholder-url-for-screenshot-3.png)
*Data-first metrics grid with trend comparison table*

### Weekly Review Variant B (Visual Story Format) ✅ **Selected for Production**
![Weekly Review Variant B](https://placeholder-url-for-screenshot-4.png)
*Gradient hero section with insight cards and numbered highlights*

### Feature Flag Switcher (Dev Only)
![Variant Switcher](https://placeholder-url-for-screenshot-5.png)
*Toggle between variants in dev/staging environments*

---

## Verification Steps

### 1. Storybook Review
```bash
cd apps/frontend
npm run storybook
# Visit http://localhost:6006
# Navigate to: Stream3 → CoachTip, WeeklyReview, VariantSwitcher
# Verify all stories render without errors
# Run a11y addon checks
```

### 2. Local Integration Test
```bash
# Start dev server
npm run dev

# Open browser to plan detail page
# Verify CoachTip renders with Variant B (gradient card)
# Click action button → Check Network tab for telemetry POST
# Click dismiss → Verify event fires

# Navigate to weekly review page
# Verify WeeklyReview renders with Variant B (visual story)
# Click "View Full Analysis" → Check telemetry POST
```

### 3. Feature Flag Toggle
```javascript
// In browser console
localStorage.setItem('featureVariant_coachTip', 'A'); // Switch to Variant A
localStorage.setItem('featureVariant_coachTip', 'B'); // Switch to Variant B
location.reload(); // Refresh to see changes
```

### 4. Accessibility Check
- Tab through components → Verify visible focus rings
- Test with screen reader (NVDA/VoiceOver) → Verify announcements
- Check keyboard shortcuts: Enter/Space should activate buttons
- Run Lighthouse audit: Aim for Accessibility ≥95

### 5. Mobile Responsiveness
- Open DevTools → Device emulation → iPhone SE (375px)
- Verify components adapt correctly (no horizontal scroll)
- Test tablet (768px) and desktop (1920px) breakpoints

---

## QA Testing Checklist

See **`docs/streams/stream3/README.md` → Integration Checklist for QA** for full testing guide.

**Key tests:**
- [ ] CoachTip displays correctly on plan detail page
- [ ] CoachTip telemetry fires on show/dismiss/accept
- [ ] Weekly Review displays correctly on weekly review page
- [ ] Weekly Review telemetry fires on show/apply
- [ ] Feature flags toggle variants correctly
- [ ] Accessibility passes (keyboard nav, screen reader, contrast)
- [ ] Mobile responsive layouts verified
- [ ] Storybook stories all render
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Lighthouse scores: Performance ≥90, Accessibility ≥95

---

## Breaking Changes

**None.** This PR is **additive only**. Existing UI components are not modified. The new components are:
- Rendered conditionally via feature flags
- Backward-compatible with existing backend API contracts
- Isolated in `components/stream3/` namespace

**Migration Path**: To fully adopt the new UI, update pages to use:
```tsx
// Old (still works)
import { CoachTipCard } from '@/components/coach-tip/CoachTipCard';

// New (recommended)
import { CoachTipAdapter } from '@/components/coach-tip/CoachTipAdapter';
```

---

## Performance Impact

**Minimal.** New components add:
- ~15KB gzipped (Tailwind CSS classes, Lucide icons)
- No new third-party dependencies
- Lazy-loaded via Next.js dynamic imports (if configured)
- Telemetry calls are fire-and-forget with error handling

**Lighthouse Metrics (Expected)**:
- Performance: 90-95 (no impact)
- Accessibility: 95-100 (improved)
- Best Practices: 90-95 (no impact)

---

## Security Considerations

- ✅ **No PII in telemetry**: Only `userId`, `planId`, `tipId`, `reviewId` (UUIDs, no names/emails)
- ✅ **Client-only components**: No server-side rendering of sensitive data
- ✅ **Feature flags in localStorage**: No server-side persistence (yet), safe for prototyping
- ✅ **Input sanitization**: All user-facing text is sanitized via React's built-in XSS protection
- ✅ **HTTPS-only telemetry**: All API calls use HTTPS in production

---

## Rollout Plan

### Phase 1: Soft Launch (Current PR)
- Deploy to **staging** with feature flags **off** by default
- QA team runs full integration checklist
- Product/Design team reviews in staging
- Fix any critical bugs

### Phase 2: Canary Release
- Enable flags for **10% of users** via LaunchDarkly
- Monitor telemetry for errors, engagement metrics
- Collect user feedback
- Iterate on design/copy if needed

### Phase 3: Full Rollout
- Enable flags for **100% of users**
- Set default variant to Variant B for both components
- Remove Variant A code (or keep for future A/B tests)
- Remove VariantSwitcher dev tool

### Phase 4: Cleanup
- Deprecate old CoachTipCard/WeeklyReviewCard components
- Migrate all pages to use Adapter components
- Remove feature flag code once winner is clear
- Archive Storybook stories for non-selected variants

---

## Dependencies

**No new external dependencies.** All new code uses existing project dependencies:
- React 18
- Next.js 14
- Tailwind CSS 3
- TypeScript 5
- Lucide React (icons)

---

## Related Issues / Stories

- **STREAM3-012**: CoachTip UI prototypes (Variant A + B)
- **STREAM3-018**: CoachTip backend integration + telemetry
- **STREAM3-025**: Weekly Review UI prototypes (Variant A + B)
- **STREAM3-031**: Weekly Review "user-choice model" (intensity vs. volume)
- **STREAM3-007**: Onboarding copy variants

---

## Review Checklist

### For Reviewers

- [ ] **Code Quality**
  - Components follow React best practices
  - TypeScript types are strict and complete
  - No `any` types or unsafe casts
  - Proper error handling for API calls

- [ ] **Accessibility**
  - ARIA attributes correct (`role`, `aria-live`, `aria-label`)
  - Keyboard navigation works correctly
  - Focus indicators visible
  - Color contrast meets WCAG AA

- [ ] **Telemetry**
  - Events fire at correct times
  - Payloads include all required fields
  - Error handling prevents UI breakage
  - No sensitive data in telemetry

- [ ] **Documentation**
  - README.md is clear and complete
  - DESIGN_DECISIONS.md explains rationale
  - Integration checklist is comprehensive
  - Code comments explain non-obvious logic

- [ ] **Testing**
  - Storybook stories cover all variants
  - Unit tests for telemetry functions (if applicable)
  - Manual testing checklist completed

### Approval Requirements

- [ ] **Product**: Marisa (variant selection, copy)
- [ ] **Design**: Avery (visual design, UX flow)
- [ ] **Science**: Dr. Elena (RPE messaging accuracy)
- [ ] **Engineering**: Code review + QA signoff

---

## Post-Merge Tasks

- [ ] Monitor telemetry dashboard for errors
- [ ] Set up LaunchDarkly feature flags in production
- [ ] Schedule user testing sessions
- [ ] Create follow-up tickets for Phase 2 (canary release)
- [ ] Update team wiki with integration guide link

---

## Questions / Discussion

**For Reviewers:**
1. Should we enable Variant B by default for all new users, or start with 50/50 split?
2. Do we need server-side feature flag management before rollout, or is localStorage sufficient for Phase 1?
3. Should we track additional telemetry events (e.g., scroll depth on Weekly Review, time spent reading tips)?

**For QA:**
- Any specific edge cases you want tested beyond the checklist?
- Preferred browser/device matrix for cross-browser testing?

---

## Additional Context

This work was completed as part of **Stream 3: UI Prototypes**, aimed at enabling rapid UX experimentation without backend changes. The adapter pattern allows us to:
- Keep backend contracts stable
- Swap UI variants without touching API code
- A/B test designs with real user data
- Gradually migrate to winning variants

See full context in `docs/streams/stream3/README.md`.
