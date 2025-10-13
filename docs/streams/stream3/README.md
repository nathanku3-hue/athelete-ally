# Stream 3: UI Prototypes

## Overview

Stream 3 delivers multiple UI variants for key user experience components, enabling product and design teams to evaluate different approaches before committing to a final design. This stream focuses on:

- **CoachTip Component**: Adaptive insights and coaching guidance
- **Weekly Review Page**: Training summary and progress visualization
- **Onboarding Copy**: Value proposition messaging variants

## Goals

1. Enable rapid UI/UX experimentation without backend changes
2. Provide clear visual comparison between design approaches
3. Maintain consistent API contracts across variants
4. Support accessible, responsive interfaces
5. Document design decisions and tradeoffs

## Components

### 1. CoachTip Component

**Purpose**: Display contextual coaching insights and adaptive recommendations based on RPE data.

#### Variant A: Traditional Tooltip
- **Design Philosophy**: Subtle, informative, non-intrusive
- **Visual Style**: Simple callout with icon, bordered background
- **Best For**: Frequent micro-tips, contextual help
- **Key Features**:
  - Compact layout
  - Category-based color coding
  - Optional dismiss and action buttons

#### Variant B: Modern Card
- **Design Philosophy**: Prominent, engaging, story-driven
- **Visual Style**: Gradient accents, card-based, visual hierarchy
- **Best For**: Important insights, adaptive recommendations
- **Key Features**:
  - Gradient accent bar
  - RPE context badges
  - Prominent action CTAs
  - Icon-driven categorization

### 2. Weekly Review Page

**Purpose**: Summarize weekly training performance and highlight adaptive insights.

#### Variant A: Traditional Dashboard
- **Design Philosophy**: Data-first, tabular, comprehensive
- **Visual Style**: Metrics grid, data tables, clean borders
- **Best For**: Users who prefer detailed metrics and historical data
- **Key Features**:
  - 4-metric summary grid
  - Trend comparison table
  - Bulleted highlights list
  - Classic table layout

#### Variant B: Visual Story Format
- **Design Philosophy**: Narrative-driven, card-based, visual hierarchy
- **Visual Style**: Hero section, gradient cards, progressive disclosure
- **Best For**: Users who prefer visual summaries and storytelling
- **Key Features**:
  - Hero gradient header
  - Insight cards with icons
  - Numbered highlights
  - Prominent CTA

### 3. Onboarding Copy Variants

**Purpose**: Test different value propositions for first-time users.

#### Variant A: Technical/Data-driven
- **Tone**: Professional, metrics-focused
- **Emphasis**: Precision, algorithms, data analysis
- **Target Audience**: Power users, data enthusiasts

#### Variant B: Personalized/Adaptive
- **Tone**: Friendly, coach-like, empowering
- **Emphasis**: AI learning, personal adaptation, partnership
- **Target Audience**: Broader audience, relationship-focused users

## Feature Flag System

All variants use a lightweight feature flag hook (`useFeatureVariant`) that:

- Stores preferences in localStorage
- Supports runtime toggling via `VariantSwitcher` component
- Can be replaced with LaunchDarkly or similar service
- Maintains separate flags for each feature area

### Usage

```typescript
import { useFeatureVariant } from '@/hooks/useFeatureVariant';

// In a component
const variant = useFeatureVariant('coachTip'); // Returns 'A' | 'B'
```

### Toggle Variants (Development)

Include the `VariantSwitcher` component (dev-only) to toggle variants in browser:

```typescript
import { VariantSwitcher } from '@/components/stream3/VariantSwitcher';

// In your layout or page
<VariantSwitcher />
```

## Storybook Integration

All components include comprehensive Storybook stories:

- **CoachTip**: `/apps/frontend/src/components/stream3/CoachTip.stories.tsx`
- **WeeklyReview**: `/apps/frontend/src/components/stream3/WeeklyReview.stories.tsx`
- **VariantSwitcher**: `/apps/frontend/src/components/stream3/VariantSwitcher.stories.tsx`

### Running Storybook

```bash
cd apps/frontend
npm run storybook
```

Visit `http://localhost:6006` to explore all variants interactively.

## Accessibility

All components meet WCAG 2.1 Level AA standards:

- ✅ Semantic HTML with proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Screen reader friendly
- ✅ Focus indicators on interactive elements

Accessibility is verified via Storybook's a11y addon.

## File Structure

```
apps/frontend/src/
├── components/
│   ├── coach-tip/
│   │   ├── CoachTipCard.tsx         # Original backend-integrated card
│   │   └── CoachTipAdapter.tsx      # Adapter: backend → variants (with telemetry)
│   ├── weekly-review/
│   │   ├── WeeklyReviewCard.tsx     # Original backend-integrated card
│   │   └── WeeklyReviewAdapter.tsx  # Adapter: backend → variants (with telemetry)
│   └── stream3/
│       ├── CoachTip.tsx             # Unified variant switcher
│       ├── CoachTipVariantA.tsx     # Traditional tooltip
│       ├── CoachTipVariantB.tsx     # Modern card
│       ├── CoachTip.stories.tsx     # Storybook stories
│       ├── WeeklyReview.tsx         # Unified variant switcher
│       ├── WeeklyReviewVariantA.tsx # Traditional dashboard
│       ├── WeeklyReviewVariantB.tsx # Visual story format
│       ├── WeeklyReview.stories.tsx # Storybook stories
│       ├── VariantSwitcher.tsx      # Dev toggle tool
│       └── VariantSwitcher.stories.tsx
├── hooks/
│   └── useFeatureVariant.ts         # Feature flag hook
└── lib/
    ├── coach-tip.ts                 # API + telemetry for CoachTip
    ├── weekly-review.ts             # API + telemetry for WeeklyReview
    └── stream3/
        └── onboarding-copy.ts       # Copy variants

packages/shared-types/src/
├── coach-tip.ts                     # CoachTip types (backend contract)
└── weekly-review.ts                 # WeeklyReview types (backend contract)

docs/streams/stream3/
├── README.md                        # This file
├── DESIGN_DECISIONS.md              # Design rationale
└── feature-flags-telemetry.md       # Feature flags & telemetry spec
```

## Design Decisions

See [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) for detailed rationale behind each variant.

## Integration Guide

### Using Adapter Components (Recommended)

For production use with backend API integration and automatic telemetry:

#### CoachTip with Backend Data

```typescript
import { CoachTipAdapter } from '@/components/coach-tip/CoachTipAdapter';
import { fetchCoachTip } from '@/lib/coach-tip';

const tip = await fetchCoachTip(planId);
if (tip) {
  <CoachTipAdapter
    tip={tip}
    onDismiss={() => handleDismiss()}
    onAccept={() => handleAccept()}
  />
}
```

The adapter:
- Automatically maps backend `CoachTipPayload` types to variant props
- Sends telemetry events (`coach_tip_shown`, `coach_tip_dismissed`, `coach_tip_accepted`)
- Respects feature flags to switch between Variant A/B

#### WeeklyReview with Backend Data

```typescript
import { WeeklyReviewAdapter } from '@/components/weekly-review/WeeklyReviewAdapter';
import { fetchWeeklyReview } from '@/lib/weekly-review';

const review = await fetchWeeklyReview(planId);
if (review) {
  <WeeklyReviewAdapter
    review={review}
    onApplied={() => handleApplied()}
  />
}
```

The adapter:
- Transforms `WeeklyReviewSummary` backend types to variant props
- Handles "Apply adjustments" action automatically
- Sends `weekly_review_applied` telemetry
- Respects feature flags to switch between Variant A/B

### Using Variant Components Directly (Prototyping)

For Storybook demos, static content, or manual data:

#### CoachTip Variants

```typescript
import { CoachTip } from '@/components/stream3/CoachTip';

<CoachTip
  category="insight"
  title="Recovery Insight"
  message="Your body is adapting well to the current load."
  rpeContext="Avg RPE: 7.2"
  dismissible={true}
  onDismiss={() => console.log('Dismissed')}
  action={{
    label: 'Learn More',
    onClick: () => navigate('/insights')
  }}
/>
```

#### WeeklyReview Variants

```typescript
import { WeeklyReview } from '@/components/stream3/WeeklyReview';

<WeeklyReview
  data={{
    weekNumber: 12,
    dateRange: 'Jan 15 - Jan 21, 2025',
    totalSessions: 5,
    completionRate: 100,
    avgRPE: 7.2,
    totalVolume: 12500,
    volumeUnit: 'kg',
    highlights: ['Milestone achieved', 'Great consistency'],
    trends: [
      { label: 'Volume', value: '12,500 kg', change: 'up', changePercent: 8 }
    ]
  }}
  onViewDetails={() => navigate('/weekly-details')}
/>
```

## Integration Checklist for QA

**Purpose**: This checklist guides QA through verifying the Stream 3 UI integration in staging/production environments.

### Prerequisites

- [ ] Access to staging environment (`https://staging.athlete-ally.com`)
- [ ] Test user account with active training plan
- [ ] Browser DevTools enabled for network inspection
- [ ] Feature flag access (LaunchDarkly dashboard or localStorage overrides)

### 1. Feature Flag Configuration

**CoachTip Flag**: `coachTip`
- [ ] Open browser console: `localStorage.setItem('featureVariant_coachTip', 'A')` for Variant A
- [ ] Open browser console: `localStorage.setItem('featureVariant_coachTip', 'B')` for Variant B (default)
- [ ] Refresh page and verify component switches correctly

**WeeklyReview Flag**: `weeklyReview`
- [ ] Open browser console: `localStorage.setItem('featureVariant_weeklyReview', 'A')` for Variant A
- [ ] Open browser console: `localStorage.setItem('featureVariant_weeklyReview', 'B')` for Variant B (default)
- [ ] Refresh page and verify component switches correctly

**Onboarding Copy Flag**: `onboardingCopy`
- [ ] Set to `'B'` by default (AI coach messaging)
- [ ] Verify onboarding flow displays Variant B copy

### 2. CoachTip Integration Tests

**Test Plan: `/plans/{planId}` (Plan Detail Page)**

- [ ] **Display Test**
  - Navigate to plan detail page with active plan
  - Verify CoachTip appears (if backend returns tip data)
  - Confirm gradient accent bar, icon, title, and message render correctly
  - Verify RPE context badge displays (e.g., "Avg RPE: 7.2")

- [ ] **Telemetry Test**
  - Open DevTools Network tab, filter for `/telemetry`
  - On page load: Verify `POST /v1/telemetry/coach-tip` with `event: "coach_tip_shown"`
  - Click dismiss (X) button: Verify `event: "coach_tip_dismissed"`
  - Click action button: Verify `event: "coach_tip_accepted"`
  - Confirm all payloads include `tipId`, `planId`, `userId`, `timestamp`

- [ ] **Variant Toggle Test**
  - Switch flag to Variant A: Verify simpler tooltip design appears
  - Switch flag to Variant B: Verify gradient card design appears
  - Confirm telemetry continues to fire correctly for both variants

- [ ] **Accessibility Test**
  - Tab through component: Verify focus moves to action button → dismiss button
  - Verify visible focus rings on all interactive elements
  - Test with screen reader (NVDA/VoiceOver): Confirm tip content is announced
  - Check keyboard activation: Enter/Space on focused buttons should trigger actions

### 3. Weekly Review Integration Tests

**Test Plan: `/weekly-review` or `/plans/{planId}/week/{weekNum}` (Weekly Review Page)**

- [ ] **Display Test**
  - Navigate to weekly review page for completed week
  - Verify hero section with gradient header displays week number and date range
  - Confirm quick stats grid shows: Sessions, Completion %, Avg RPE, Volume
  - Verify performance insights card shows trend data with icons and percentages
  - Confirm highlights card displays numbered wins (1, 2, 3...)

- [ ] **Telemetry Test**
  - Open DevTools Network tab, filter for `/telemetry`
  - On page load: Verify `POST /v1/telemetry/weekly-review` with `event: "weekly_review_shown"`
  - Click "View Full Analysis" or "Apply Adjustments" button: Verify `event: "weekly_review_applied"`
  - Confirm payload includes `reviewId`, `planId`, `userId`, `status`, `timestamp`

- [ ] **Intensity vs. Volume Toggle Test** (if implemented)
  - Look for "Prefer Intensity" / "Prefer Volume" toggle button
  - Click toggle: Verify adjustment recommendations update
  - Confirm telemetry fires: `event: "adjustment_preference_changed"`
  - Verify backend receives preference and updates next week's plan

- [ ] **Variant Toggle Test**
  - Switch flag to Variant A: Verify traditional dashboard (table-based) appears
  - Switch flag to Variant B: Verify visual story format (cards) appears
  - Confirm both variants display same underlying data

- [ ] **Accessibility Test**
  - Tab through component: Verify focus moves to "View Full Analysis" button
  - Test keyboard navigation: Enter/Space should activate CTA
  - Screen reader test: Verify headings, stats, and highlights are properly announced
  - Check color contrast: Gradient hero section should maintain ≥4.6:1 contrast ratio

### 4. Onboarding Copy Tests

**Test Plan: `/onboarding` (First-Time User Flow)**

- [ ] **Display Test**
  - Create new test user or clear onboarding state
  - Navigate to onboarding flow
  - Verify Variant B copy appears:
    - Hero headline: "Your AI Coach, Learning Every Day"
    - RPE intro: "Teaching Your AI Coach How You Feel"
    - Adaptive engine: "How Your AI Coach Works With You"

- [ ] **Toggle Test**
  - Switch flag to Variant A: Verify technical copy appears
    - Hero headline: "Precision Training, Powered by Data"
    - RPE intro: "Understanding RPE (Rate of Perceived Exertion)"
  - Confirm onboarding flow functions identically with both variants

- [ ] **A/B Test Verification** (if enabled)
  - Verify analytics cohort assignment
  - Confirm users are randomly assigned to A or B on first visit
  - Check that assignment persists across sessions

### 5. Storybook Visual Regression

- [ ] Navigate to Storybook (`http://localhost:6006` or staging Storybook URL)
- [ ] Verify all stories render without errors:
  - CoachTip → VariantA, VariantB, With RPE Context, Dismissible, With Action
  - WeeklyReview → VariantA, VariantB, With Trends, Mobile View
  - VariantSwitcher → Default state, Toggle behavior
- [ ] Run Storybook a11y addon checks: Confirm no violations

### 6. Mobile Responsiveness

- [ ] Test on mobile viewport (375px width)
  - CoachTip: Verify card adapts to narrow screen, no horizontal scroll
  - Weekly Review: Verify hero section, stats grid, and cards stack vertically
  - Onboarding: Verify copy is readable and buttons are accessible

- [ ] Test on tablet viewport (768px width)
  - Verify components use appropriate breakpoints (md: class)

- [ ] Test on desktop viewport (1920px width)
  - Verify components don't stretch excessively

### 7. Error Handling & Edge Cases

- [ ] **No CoachTip Data**
  - Navigate to plan with no active tips
  - Verify no CoachTip component renders (graceful null handling)

- [ ] **Failed Telemetry**
  - Block `/v1/telemetry/*` requests in DevTools Network throttling
  - Verify UI continues to function (telemetry errors logged to console in dev mode)
  - Check console for warning: `console.warn('Coach tip telemetry failed', ...)`

- [ ] **Empty Weekly Review**
  - Navigate to week with 0 completed sessions
  - Verify component displays "No data yet" state or defaults to 0 values

- [ ] **Long Text Overflow**
  - Test with CoachTip message >200 characters
  - Verify text wraps correctly and doesn't break layout

### 8. Cross-Browser Testing

- [ ] Chrome (latest): Verify all functionality
- [ ] Firefox (latest): Verify all functionality
- [ ] Safari (latest): Verify gradient rendering and backdrop-blur
- [ ] Edge (latest): Verify all functionality

### 9. Performance & Lighthouse

- [ ] Run Lighthouse audit on plan detail page
  - Performance: ≥90
  - Accessibility: ≥95
  - Best Practices: ≥90

- [ ] Verify no console errors or warnings in production build

### 10. Final Signoff

- [ ] Product team approval (Marisa)
- [ ] Design team approval (Avery)
- [ ] Science team approval (Dr. Elena) - Verify RPE messaging accuracy
- [ ] QA signoff: All checklist items passed

---

**Note**: If any checklist item fails, file a bug report with:
1. Test step that failed
2. Expected behavior vs. actual behavior
3. Screenshots/video
4. Browser/OS details
5. Feature flag configuration

## Testing & Validation

- [x] All components render correctly in Storybook
- [x] Accessibility checks pass (ARIA, semantic HTML, focus indicators)
- [x] Keyboard navigation works
- [x] Feature flags toggle correctly via VariantSwitcher
- [x] Mobile responsive layouts verified (Tailwind breakpoints)
- [x] Copy variants documented (onboarding-copy.ts)
- [x] Adapter components integrate backend types correctly
- [x] Telemetry hooks fire on user actions
- [x] Type-checking passes (TypeScript strict mode)
- [x] Linting passes (ESLint unified config)

### Telemetry Testing & Mock Payloads

**Test Date**: 2025-01-21
**Environment**: Development mode with network logging
**Endpoints**: `/v1/telemetry/coach-tip`, `/v1/telemetry/weekly-review`

#### CoachTip Telemetry Events

All CoachTip interactions are automatically tracked:

- **`coach_tip_shown`** - Fires when CoachTipAdapter mounts
- **`coach_tip_dismissed`** - Fires when user clicks dismiss (X) button
- **`coach_tip_accepted`** - Fires when user clicks action button

**Mock Payload for Testing**:

```typescript
const mockCoachTip: CoachTipPayload = {
  tipId: 'tip_2025_01_21_001',
  planId: 'plan_athlete_123',
  userId: 'user_456',
  surface: 'plan_detail',
  severity: 'info',
  title: 'Recovery Insight',
  message: 'Your RPE trend shows excellent recovery. Ready to increase intensity.',
  guidance: 'Consider adding 5-10% volume to your next workout.',
  actions: [
    { type: 'apply', label: 'Apply Suggestion', actionId: 'apply_volume' }
  ],
  scoringContext: { safetyScore: 85, complianceScore: 92, totalScore: 85 },
  createdAt: '2025-01-21T10:30:00Z'
};
```

**Expected Telemetry POST** (`/v1/telemetry/coach-tip`):

```json
{
  "event": "coach_tip_shown",
  "tipId": "tip_2025_01_21_001",
  "planId": "plan_athlete_123",
  "userId": "user_456",
  "surface": "plan_detail",
  "severity": "info",
  "planScore": 85,
  "timestamp": "2025-01-21T10:30:15.234Z"
}
```

**Verification**: Open DevTools Network tab → Filter "telemetry" → Render `<CoachTipAdapter tip={mockCoachTip} />` → Confirm events fire on mount/dismiss/accept.

#### WeeklyReview Telemetry Events

- **`weekly_review_shown`** - Fires when WeeklyReviewAdapter mounts
- **`weekly_review_applied`** - Fires when user applies adjustments

**Mock Payload for Testing**:

```typescript
const mockWeeklyReview: WeeklyReviewSummary = {
  reviewId: 'review_week_12_2025',
  planId: 'plan_athlete_123',
  userId: 'user_456',
  weekNumber: 12,
  startDate: '2025-01-15',
  endDate: '2025-01-21',
  status: 'pending',
  completedSessions: 5,
  totalSessions: 5,
  completionRate: 100,
  avgRPE: 7.2,
  totalVolume: 12500,
  adjustments: [
    {
      metric: 'Volume',
      unit: 'percent',
      baseline: 12000,
      adjusted: 12500,
      direction: 'up',
      summary: 'Increase volume by 4%'
    }
  ],
  highlights: ['Perfect week - 5/5 sessions', 'Volume capacity +8%']
};
```

**Expected Telemetry POST** (`/v1/telemetry/weekly-review`):

```json
{
  "event": "weekly_review_applied",
  "reviewId": "review_week_12_2025",
  "planId": "plan_athlete_123",
  "userId": "user_456",
  "status": "applied",
  "timestamp": "2025-01-21T10:35:42.123Z"
}
```

**Verification**: Render `<WeeklyReviewAdapter review={mockWeeklyReview} />` → Click "Apply Adjustments" → Confirm `weekly_review_applied` event fires with correct payload.

#### Development Error Handling

Failed telemetry calls log warnings without blocking UI:

```javascript
console.warn('Coach tip telemetry failed', { error: 'Network timeout', tipId: '...' });
```

This ensures analytics failures don't impact user experience.

## Next Steps

1. **Product Review**: Share Storybook links with product/design team
2. **User Testing**: Gather feedback on preferred variants
3. **A/B Testing**: Integrate with analytics to measure engagement
4. **Final Selection**: Choose winning variants based on data
5. **Cleanup**: Remove unused variants and dev tools

## Contact

For questions or feedback, reach out to the Stream 3 team.
