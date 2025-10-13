# Stream 3 UI Review - Quick Start

⚡ **5-Minute Setup** to see the UI prototypes

---

## Option 1: Storybook (Fastest - No Backend Needed)

```bash
cd apps/frontend
npm run storybook
```

Open **http://localhost:6006**

Navigate to: `Stream3` → `CoachTip` or `WeeklyReview`

✅ **Best for**: Design review, variant comparison, accessibility testing

---

## Option 2: Dev Server (Full Integration)

```bash
cd apps/frontend
npm run dev
```

Open **http://localhost:3000**

### Toggle Variants (Browser Console):

```javascript
// Use Variant B for CoachTip
localStorage.setItem('featureVariant_coachTip', 'B');

// Use Variant B for WeeklyReview
localStorage.setItem('featureVariant_weeklyReview', 'B');

// Refresh
location.reload();
```

✅ **Best for**: Integration testing, telemetry verification, real workflow

---

## Quick Tests

### Test CoachTip

Create: `apps/frontend/src/app/test-coach-tip/page.tsx`

```tsx
"use client";
import { CoachTip } from '@/components/stream3/CoachTip';

export default function TestPage() {
  return (
    <div className="p-8">
      <CoachTip
        category="insight"
        title="Recovery Insight"
        message="Your RPE trend shows excellent recovery."
        rpeContext="Avg RPE: 7.2"
        dismissible={true}
        action={{ label: 'Learn More', onClick: () => alert('Clicked!') }}
      />
    </div>
  );
}
```

Visit: **http://localhost:3000/test-coach-tip**

---

### Test WeeklyReview

Create: `apps/frontend/src/app/test-weekly-review/page.tsx`

```tsx
"use client";
import { WeeklyReview } from '@/components/stream3/WeeklyReview';

export default function TestPage() {
  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <WeeklyReview
        data={{
          weekNumber: 12,
          dateRange: 'Jan 15 - Jan 21, 2025',
          totalSessions: 5,
          completionRate: 100,
          avgRPE: 7.2,
          totalVolume: 12500,
          volumeUnit: 'kg',
          highlights: ['Perfect week!', 'Great consistency'],
          trends: [
            { label: 'Volume', value: '12,500 kg', change: 'up', changePercent: 8 }
          ]
        }}
        onViewDetails={() => alert('Clicked!')}
      />
    </div>
  );
}
```

Visit: **http://localhost:3000/test-weekly-review**

---

## Keyboard Navigation Test

1. **Tab** → Move focus to next element
2. **Enter/Space** → Activate button
3. **Shift+Tab** → Move focus backward

✅ **Pass if**: All buttons are reachable and have visible focus rings

---

## Check Telemetry

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter for "telemetry"
4. Click buttons in components
5. Verify POST requests appear

---

## Toggle Between Variants

### In Browser Console:

```javascript
// Switch to Variant A
localStorage.setItem('featureVariant_coachTip', 'A');
location.reload();

// Switch to Variant B
localStorage.setItem('featureVariant_coachTip', 'B');
location.reload();
```

### Or Use DevTools Application Tab:

1. F12 → **Application** → **Local Storage**
2. Find `featureVariant_coachTip`
3. Double-click value → Change to `'A'` or `'B'`
4. Refresh page

---

## Variant Comparison (Side-by-Side)

1. Open **http://localhost:6006** (Storybook)
2. Navigate to `Stream3` → `CoachTip`
3. Click **"Variant A"** story → Right-click → "Open Link in New Tab"
4. Click **"Variant B"** story → Right-click → "Open Link in New Tab"
5. Arrange tabs side-by-side (Windows: Win + Left/Right)

---

## Mobile Test

**In Chrome DevTools**:
1. F12 → **Toggle Device Toolbar** (Ctrl+Shift+M)
2. Select device: **iPhone SE** (375px)
3. Verify components adapt correctly

**Breakpoints to test**:
- 375px (Mobile)
- 768px (Tablet)
- 1920px (Desktop)

---

## Accessibility Quick Check

### Color Contrast

Right-click text → Inspect → Check computed colors

Expected: ≥4.5:1 for regular text, ≥3:1 for large text

### Screen Reader (Windows)

1. Download **NVDA**: https://www.nvaccess.org/download/
2. Start NVDA (Ctrl+Alt+N)
3. Navigate to component
4. Verify content is announced

---

## Report Issues

**Bug report format**:

```
Title: [Component] - [Issue]

Steps:
1. Set featureVariant_coachTip to 'B'
2. Navigate to /plans/123
3. Click dismiss button

Expected: Telemetry fires
Actual: No event fired

Browser: Chrome 122
OS: Windows 11
```

---

## Need Help?

📖 **Full Guide**: `docs/streams/stream3/UI_REVIEW_GUIDE.md`
📋 **QA Checklist**: `docs/streams/stream3/README.md` → Integration Checklist
🎨 **Design Decisions**: `docs/streams/stream3/DESIGN_DECISIONS.md`

---

**That's it! Start with Storybook for the quickest review. 🚀**
