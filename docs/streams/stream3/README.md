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

## Next Steps

1. **Product Review**: Share Storybook links with product/design team
2. **User Testing**: Gather feedback on preferred variants
3. **A/B Testing**: Integrate with analytics to measure engagement
4. **Final Selection**: Choose winning variants based on data
5. **Cleanup**: Remove unused variants and dev tools

## Contact

For questions or feedback, reach out to the Stream 3 team.
