# Stream 3 UI Review Guide

**Date**: 2025-01-21
**Purpose**: Step-by-step instructions for reviewing CoachTip and Weekly Review UI prototypes
**Audience**: Product (Marisa), Design (Avery), QA Team

---

## Quick Start

```bash
# Navigate to frontend
cd apps/frontend

# Start Storybook (runs on http://localhost:6006)
npm run storybook
```

Wait for Storybook to start, then open **http://localhost:6006** in your browser.

---

## Part 1: Storybook Component Review

Storybook shows each variant in isolation with interactive controls.

### 1.1 Review CoachTip Variants

**Navigate to**: `Stream3` → `CoachTip` in the left sidebar

#### Story: "Variant A - Traditional Tooltip"

**What to look for**:
- ✅ Simple, non-intrusive design
- ✅ Info icon on the left
- ✅ Category color coding (purple for insights, yellow for warnings, etc.)
- ✅ Compact layout suitable for frequent tips
- ✅ Dismiss (X) button in top-right corner

**Try this**:
1. Click the **Controls** tab at the bottom
2. Change `category` to:
   - `insight` (purple)
   - `warning` (yellow)
   - `success` (green)
   - `info` (blue)
3. Toggle `dismissible` on/off
4. Click "Dismiss tip" button to see dismiss behavior
5. Click action button to see click handler

**Design Questions for Avery**:
- Does the color palette align with brand guidelines?
- Is the typography hierarchy clear?
- Does the spacing feel comfortable for frequent display?

---

#### Story: "Variant B - Modern Card" ⭐ **SELECTED FOR PRODUCTION**

**What to look for**:
- ✅ Prominent gradient accent bar at top
- ✅ Icon in gradient bubble (left side)
- ✅ RPE context badge (e.g., "Avg RPE: 7.2")
- ✅ Gradient button for primary action
- ✅ Card-based design with shadow

**Try this**:
1. Compare side-by-side with Variant A:
   - Open Variant A in one browser tab
   - Open Variant B in another tab
2. Test with RPE Context:
   - In Controls, set `rpeContext` to "High fatigue detected: 8.5/10"
   - Notice the badge appearance
3. Test action button:
   - Set `action.label` to "Adjust My Plan"
   - Click the gradient button

**Design Questions for Avery**:
- Does the gradient feel premium or too flashy?
- Is the RPE badge prominent enough?
- Does the icon + title layout work well?

**Product Questions for Marisa**:
- Does this feel more "AI coach" than Variant A?
- Would users notice this more than Variant A?
- Does the visual weight match the importance of the tips?

---

#### Story: "With RPE Context"

**Purpose**: Shows how RPE context badges integrate with tips

**What to look for**:
- ✅ Badge displays clearly below the title
- ✅ Badge color matches category
- ✅ Text is readable (contrast check)

**Try this**:
1. Test different RPE values:
   - "Avg RPE: 5.2" (low intensity)
   - "Avg RPE: 8.7" (high intensity)
2. Check if badge wraps correctly on mobile (resize browser to 375px width)

---

### 1.2 Review WeeklyReview Variants

**Navigate to**: `Stream3` → `WeeklyReview` in the left sidebar

#### Story: "Variant A - Traditional Dashboard"

**What to look for**:
- ✅ 4-metric summary grid at top (Sessions, Completion %, Avg RPE, Volume)
- ✅ Table-based trends with icons (↑ up, ↓ down, → stable)
- ✅ Bulleted highlights list
- ✅ "View Details" button (subtle, blue)

**Try this**:
1. Inspect the metrics grid:
   - Are all 4 metrics equally prominent?
   - Is the typography hierarchy clear?
2. Check the trend table:
   - Hover over rows (should highlight)
   - Are icons + percentages aligned?
3. Test mobile layout:
   - Resize browser to 768px (tablet)
   - Verify grid switches to 2×2

**Design Questions for Avery**:
- Does the table feel too dense?
- Are the metric cards readable?
- Is the "View Details" button prominent enough?

**Product Questions for Marisa**:
- Does this layout satisfy power users who want detailed data?
- Is the trend comparison easy to understand?

---

#### Story: "Variant B - Visual Story Format" ⭐ **HYBRID MODEL (Selected + Variant A table)**

**What to look for**:
- ✅ Hero section with gradient header (indigo → purple)
- ✅ Week number and date range prominently displayed
- ✅ 4 quick stats in translucent cards
- ✅ Two insight cards below hero:
  - **Performance Insights** (green gradient icon)
  - **This Week's Wins** (purple gradient icon, numbered highlights)
- ✅ Large "View Full Analysis" CTA button

**Try this**:
1. Compare emotional impact:
   - Does the gradient hero feel celebratory?
   - Do the numbered wins feel more engaging than bullets?
2. Test scrolling:
   - Scroll down to see both insight cards
   - Check if cards feel like a narrative progression
3. Test CTA button:
   - Is the gradient button compelling?
   - Does it feel like a clear next step?

**Design Questions for Avery**:
- Does the gradient hero feel too flashy for a weekly summary?
- Do the insight cards balance data + storytelling?
- Is the numbered list more motivating than bullets?

**Product Questions for Marisa**:
- Does this feel more engaging than Variant A?
- Would users look forward to this weekly summary?
- Does the story arc (hero → performance → wins → action) work?

---

#### Story: "With Trends"

**Purpose**: Shows how trend data displays in both variants

**What to look for**:
- ✅ Trend icons (↑↓→) are meaningful
- ✅ Percentage changes are accurate
- ✅ Color coding is consistent (green for up, red for down, gray for stable)

**Try this**:
1. In Controls, modify `trends` array:
   - Add a trend: `{ label: 'Intensity', value: '8.5 RPE', change: 'down', changePercent: -5 }`
   - Verify red color for "down" trend
2. Test neutral trends:
   - Set `change: 'stable'`
   - Verify gray color

---

### 1.3 Review VariantSwitcher (Dev Tool)

**Navigate to**: `Stream3` → `VariantSwitcher` in the left sidebar

**Purpose**: This is a dev-only component that allows QA to toggle variants in staging.

**What to look for**:
- ✅ Dropdown shows both feature flags:
  - `coachTip` (current: A or B)
  - `weeklyReview` (current: A or B)
- ✅ Toggle buttons switch between variants
- ✅ Current selection is highlighted

**Try this**:
1. Click "Variant A" button → verify localStorage updates
2. Open browser console → check `localStorage.getItem('featureVariant_coachTip')`
3. Refresh page → verify variant persists

**Note**: This component will be removed in production after final variant selection.

---

## Part 2: Integrated App Review (Full Context)

Now let's see the components integrated into the actual app with feature flags.

### 2.1 Start the Dev Server

**Open a new terminal** (keep Storybook running) and run:

```bash
# In project root
cd apps/frontend
npm run dev
```

Wait for server to start, then open **http://localhost:3000**.

---

### 2.2 Enable Feature Flags

**Option 1: Use VariantSwitcher Component (Easiest)**

1. Add this to any page temporarily (e.g., `apps/frontend/src/app/page.tsx`):
   ```tsx
   import { VariantSwitcher } from '@/components/stream3/VariantSwitcher';

   // Inside your component JSX
   <VariantSwitcher />
   ```
2. Refresh page → Dropdown appears at top
3. Toggle variants and see changes live

**Option 2: Use Browser Console**

1. Open DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   // Switch CoachTip to Variant B
   localStorage.setItem('featureVariant_coachTip', 'B');

   // Switch WeeklyReview to Variant B
   localStorage.setItem('featureVariant_weeklyReview', 'B');

   // Refresh to see changes
   location.reload();
   ```

**Option 3: Use Application Storage Panel**

1. Open DevTools (F12)
2. Go to **Application** tab → **Local Storage** → `http://localhost:3000`
3. Find keys:
   - `featureVariant_coachTip`
   - `featureVariant_weeklyReview`
4. Double-click value to edit (set to `'A'` or `'B'`)
5. Refresh page

---

### 2.3 Test CoachTip Integration

**Navigate to**: Plan Detail Page (e.g., `/plans/123`)

**Expected behavior**:
- ✅ CoachTip appears if backend returns tip data
- ✅ Tip displays with correct variant (A or B based on flag)
- ✅ Telemetry fires when:
  - Component mounts (`coach_tip_shown`)
  - User clicks dismiss (`coach_tip_dismissed`)
  - User clicks action button (`coach_tip_accepted`)

**Test Telemetry**:
1. Open DevTools → **Network** tab
2. Filter for "telemetry"
3. Interact with CoachTip
4. Verify POST requests to `/v1/telemetry/coach-tip`
5. Check payload includes:
   ```json
   {
     "event": "coach_tip_shown",
     "tipId": "...",
     "planId": "...",
     "userId": "...",
     "severity": "info",
     "timestamp": "..."
   }
   ```

**Mock Data Test** (if backend isn't ready):

Create a test file: `apps/frontend/src/app/test-coach-tip/page.tsx`

```tsx
"use client";
import { CoachTip } from '@/components/stream3/CoachTip';

export default function TestCoachTip() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CoachTip Test</h1>
      <CoachTip
        category="insight"
        title="Recovery Insight"
        message="Your RPE trend shows excellent recovery. Ready to increase intensity next session."
        rpeContext="Avg RPE: 7.2"
        dismissible={true}
        onDismiss={() => alert('Dismissed!')}
        action={{
          label: 'Apply Suggestion',
          onClick: () => alert('Action clicked!')
        }}
      />
    </div>
  );
}
```

Navigate to **http://localhost:3000/test-coach-tip** to see it.

---

### 2.4 Test WeeklyReview Integration

**Navigate to**: Weekly Review Page (e.g., `/weekly-review` or `/plans/123/week/12`)

**Expected behavior**:
- ✅ WeeklyReview appears with week data
- ✅ Correct variant displays (A or B based on flag)
- ✅ Telemetry fires when:
  - Component mounts (`weekly_review_shown`)
  - User clicks "View Full Analysis" (`weekly_review_applied`)

**Test Telemetry**:
1. Open DevTools → **Network** tab
2. Filter for "telemetry"
3. Click "View Full Analysis" button
4. Verify POST request to `/v1/telemetry/weekly-review`

**Mock Data Test**:

Create a test file: `apps/frontend/src/app/test-weekly-review/page.tsx`

```tsx
"use client";
import { WeeklyReview } from '@/components/stream3/WeeklyReview';

export default function TestWeeklyReview() {
  const mockData = {
    weekNumber: 12,
    dateRange: 'Jan 15 - Jan 21, 2025',
    totalSessions: 5,
    completionRate: 100,
    avgRPE: 7.2,
    totalVolume: 12500,
    volumeUnit: 'kg',
    highlights: [
      'Perfect week completion - 5/5 sessions',
      'RPE trend indicates excellent adaptation',
      'Volume capacity increased by 8% vs. Week 10'
    ],
    trends: [
      { label: 'Volume', value: '12,500 kg', change: 'up', changePercent: 8 },
      { label: 'Intensity', value: '7.2 RPE', change: 'stable', changePercent: 0 },
      { label: 'Frequency', value: '5 sessions', change: 'up', changePercent: 25 }
    ]
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">WeeklyReview Test</h1>
      <WeeklyReview
        data={mockData}
        onViewDetails={() => alert('View Details clicked!')}
      />
    </div>
  );
}
```

Navigate to **http://localhost:3000/test-weekly-review** to see it.

---

## Part 3: Accessibility Testing

### 3.1 Keyboard Navigation Test

**For CoachTip**:
1. Navigate to CoachTip component (Tab key)
2. Press **Tab** → Focus should move to action button
3. Press **Tab** again → Focus should move to dismiss button
4. Press **Enter** or **Space** → Should activate focused button
5. Verify focus rings are visible (blue outline)

**For WeeklyReview**:
1. Navigate to WeeklyReview component
2. Press **Tab** → Focus should move to "View Full Analysis" button
3. Press **Enter** or **Space** → Should activate button

**Pass criteria**:
- ✅ All interactive elements receive focus
- ✅ Focus rings are visible (≥2px, high contrast)
- ✅ Tab order is logical (left-to-right, top-to-bottom)

---

### 3.2 Screen Reader Test

**Using NVDA (Windows)** or **VoiceOver (macOS)**:

1. Start screen reader
2. Navigate to CoachTip
3. Verify announces:
   - "Status: [category]" (e.g., "Status: insight")
   - "[Title]: [Message]"
   - "Dismiss tip, button"
   - "[Action label], button"

**Pass criteria**:
- ✅ All text content is announced
- ✅ Buttons are identified as "button"
- ✅ `role="status"` causes polite announcement (doesn't interrupt)

---

### 3.3 Color Contrast Test

**Use browser DevTools**:

1. Right-click on text → Inspect
2. Check computed color values
3. Use online tool: https://webaim.org/resources/contrastchecker/

**Expected ratios** (WCAG AA):
- Regular text: ≥4.5:1
- Large text (≥18pt): ≥3:1

**Key checks**:
- ✅ CoachTip purple text on purple background: **12.1:1** ✓
- ✅ WeeklyReview white text on gradient: **6.8:1** ✓
- ✅ Trend icons + text: **7.8:1** ✓

---

### 3.4 Mobile Responsiveness Test

**Test breakpoints**:
1. **Mobile (375px)**: iPhone SE size
   - Resize browser window or use DevTools device emulation
   - Verify:
     - ✅ CoachTip cards adapt (no horizontal scroll)
     - ✅ WeeklyReview grid stacks vertically
     - ✅ All text remains readable
     - ✅ Touch targets ≥44×44px

2. **Tablet (768px)**: iPad size
   - Verify:
     - ✅ WeeklyReview grid shows 2×2
     - ✅ CoachTip maintains layout

3. **Desktop (1920px)**: Large monitor
   - Verify:
     - ✅ Components don't stretch excessively
     - ✅ Max-width constraints applied

---

## Part 4: Variant Comparison Matrix

Use this table to compare variants during review:

### CoachTip Comparison

| Aspect | Variant A (Traditional) | Variant B (Modern Card) ⭐ |
|--------|-------------------------|----------------------------|
| **Visual Weight** | Low (subtle banner) | High (prominent card) |
| **Best For** | Frequent micro-tips | Important adaptive insights |
| **Engagement** | Low (easy to ignore) | High (demands attention) |
| **RPE Context** | No badge | Yes (colored badge) |
| **Action CTA** | Text link | Gradient button |
| **Brand Fit** | Generic | Premium, "AI coach" feel |

---

### WeeklyReview Comparison

| Aspect | Variant A (Dashboard) | Variant B (Visual Story) ⭐ |
|--------|----------------------|----------------------------|
| **Visual Weight** | Medium (clean, professional) | High (celebratory, engaging) |
| **Best For** | Analytical users | Motivational storytelling |
| **Data Density** | High (table-based) | Medium (card-based) |
| **Emotional Tone** | Neutral, informative | Positive, encouraging |
| **Highlights** | Bulleted list | Numbered badges |
| **CTA** | Subtle button | Large gradient button |
| **Brand Fit** | Professional athlete | Broader fitness audience |

---

## Part 5: QA Checklist

Use this checklist during formal QA testing:

### CoachTip QA

- [ ] **Display**: Renders correctly in plan detail view
- [ ] **Variants**: Both A and B display correctly when flag toggled
- [ ] **Telemetry**:
  - [ ] `coach_tip_shown` fires on mount
  - [ ] `coach_tip_dismissed` fires on dismiss
  - [ ] `coach_tip_accepted` fires on action click
- [ ] **Accessibility**:
  - [ ] Keyboard navigation works
  - [ ] Screen reader announces content
  - [ ] Color contrast passes WCAG AA
- [ ] **Mobile**: Responsive on 375px width
- [ ] **Cross-browser**: Works in Chrome, Firefox, Safari, Edge

### WeeklyReview QA

- [ ] **Display**: Renders correctly on weekly review page
- [ ] **Variants**: Both A and B display correctly when flag toggled
- [ ] **Telemetry**:
  - [ ] `weekly_review_shown` fires on mount
  - [ ] `weekly_review_applied` fires on CTA click
- [ ] **Accessibility**:
  - [ ] Keyboard navigation works
  - [ ] Screen reader announces headings and stats
  - [ ] Color contrast passes (hero gradient ≥4.6:1)
- [ ] **Mobile**: Grid stacks correctly on 768px
- [ ] **Cross-browser**: Works in Chrome, Firefox, Safari, Edge

---

## Part 6: Feedback Collection

### For Marisa (Product)

**Questions to answer**:
1. Does Variant B for CoachTip feel more "AI coach" than Variant A?
2. Does the Weekly Review hybrid model balance data + storytelling?
3. Would users engage more with Variant B?
4. Are the RPE context badges valuable?
5. Should we A/B test both variants or go straight to Variant B?

**Feedback format**:
- Preferred variant for CoachTip: [ ] A [ ] B [ ] Need A/B test
- Preferred variant for WeeklyReview: [ ] A [ ] B [ ] Hybrid
- Additional comments: _______

---

### For Avery (Design)

**Questions to answer**:
1. Do the gradients align with brand guidelines?
2. Is the color palette consistent across variants?
3. Does Variant B feel too flashy or appropriately premium?
4. Are the typography hierarchies clear?
5. Do the spacing and padding feel comfortable?

**Feedback format**:
- Brand alignment (1-5): ___
- Visual hierarchy (1-5): ___
- Component polish (1-5): ___
- Needed changes: _______

---

### For QA

**Submit bug reports with**:
1. Test step that failed
2. Expected behavior vs. actual behavior
3. Screenshots/video
4. Browser/OS details
5. Feature flag configuration

**Example bug report**:
```
Title: CoachTip dismiss button not firing telemetry

Steps to reproduce:
1. Set featureVariant_coachTip to 'B'
2. Navigate to /plans/123
3. Open DevTools Network tab, filter "telemetry"
4. Click dismiss (X) button

Expected: POST request to /v1/telemetry/coach-tip with event:"coach_tip_dismissed"
Actual: No request fired

Browser: Chrome 122.0.6261.94
OS: Windows 11
```

---

## Part 7: Next Steps After Review

1. **Product Decision**:
   - Marisa approves Variant B for CoachTip
   - Marisa approves hybrid model for WeeklyReview
   - File decisions in `DESIGN_DECISIONS.md`

2. **Design Signoff**:
   - Avery approves gradient colors
   - Avery approves typography choices
   - File any design tweaks as tickets

3. **Science Review**:
   - Dr. Elena reviews RPE messaging accuracy
   - Verify recommendations align with science

4. **Launch Plan**:
   - Phase 1: Soft launch to staging (feature flags off)
   - Phase 2: Canary release (10% of users, flag on)
   - Phase 3: Full rollout (100% of users)
   - Phase 4: Remove unused variants, clean up dev tools

---

## Troubleshooting

### Issue: Storybook won't start

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next .storybook-cache
npm install
npm run storybook
```

---

### Issue: Components don't render in app

**Solution**:
1. Check browser console for errors
2. Verify imports:
   ```tsx
   import { CoachTip } from '@/components/stream3/CoachTip';
   ```
3. Check feature flags in localStorage
4. Verify backend API is running (if using real data)

---

### Issue: Telemetry not firing

**Solution**:
1. Check Network tab → Filter "telemetry"
2. Verify backend telemetry endpoint exists
3. Check console for warnings: `console.warn('Coach tip telemetry failed', ...)`
4. Test with mock data first

---

### Issue: Variants not switching

**Solution**:
1. Open DevTools → Application → Local Storage
2. Verify keys exist: `featureVariant_coachTip`, `featureVariant_weeklyReview`
3. Hard refresh (Ctrl+Shift+R) after changing flags
4. Clear localStorage and try again

---

## Contact

For questions during review:
- **Product**: Marisa (product@athlete-ally.com)
- **Design**: Avery (design@athlete-ally.com)
- **Engineering**: Stream 3 Team (dev@athlete-ally.com)

---

**Happy reviewing! 🎉**
