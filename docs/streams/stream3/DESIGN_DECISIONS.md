# Stream 3: Design Decisions

## Overview

This document explains the rationale behind each UI variant and the tradeoffs considered.

## Final Selections (2025-01-21)

After product/design review and internal evaluation, the following variants have been selected for integration:

### CoachTip: Variant B (Modern Card / "Slide-In Card")

**Selected Variant**: `CoachTipVariantB` (Modern Card with gradient accents)

**Decision Rationale**:
1. **Differentiation**: The gradient card design better communicates the "AI coach" value proposition and adaptive intelligence, which is core to Athlete Ally's positioning.
2. **RPE Context**: The badge system for displaying RPE context ("Avg RPE: 7.2") makes adaptive recommendations more credible and transparent.
3. **Engagement**: Visual prominence increases likelihood that users will read and act on tips, especially for critical insights (deload recommendations, recovery alerts).
4. **Testing Feedback**: Early Storybook reviews indicated that Variant B felt more "premium" and "personalized" compared to Variant A's generic tooltip style.

**Implementation Notes**:
- Used for high-value, infrequent tips (weekly insights, milestone recommendations, safety alerts)
- Appears in plan detail view, weekly review page, and post-session summary
- Feature flag: `coachTip` → defaults to `'B'` in production
- Telemetry tracking: `coach_tip_shown`, `coach_tip_dismissed`, `coach_tip_accepted`

**Related Story IDs**: STREAM3-012, STREAM3-018

---

### Weekly Review: Hybrid Model ("User-Choice Review")

**Selected Approach**: Adaptive hybrid combining both Variant A and Variant B elements

**Decision Rationale**:
1. **User Preference**: Rather than forcing one approach, the hybrid model allows users to toggle between:
   - **Intensity Focus** (fewer sessions, higher intensity)
   - **Volume Focus** (more sessions, moderate intensity)
2. **Data + Story**: The hybrid combines Variant A's detailed metrics table with Variant B's visual cards for highlights and insights.
3. **Flexibility**: Accommodates both analytical users (who want tables) and visual users (who prefer cards) without requiring separate builds.
4. **Adaptive Engine Integration**: The toggle directly maps to backend planning engine parameters (`adjustmentPreference: 'intensity' | 'volume'`), enabling true personalization.

**Implementation Notes**:
- Default view shows Variant B's hero section + Variant A's metrics grid
- Toggle button at top: "Prefer Intensity" vs "Prefer Volume"
- Selected preference saved to user profile and applied to next week's plan
- Feature flag: `weeklyReview` → currently set to `'B'` as primary, with Variant A table embedded
- Telemetry tracking: `weekly_review_shown`, `weekly_review_applied`, `adjustment_preference_changed`

**Related Story IDs**: STREAM3-025, STREAM3-031

---

### Onboarding Copy: Variant B (Personalized/Adaptive)

**Selected Variant**: `onboardingCopyB` (Personalized coach messaging)

**Decision Rationale**:
1. **Broader Appeal**: Variant B's "AI coach that learns" framing resonates with a wider audience than Variant A's technical language.
2. **Emotional Connection**: The coaching metaphor builds trust and sets expectations for a long-term partnership, which is critical for retention.
3. **Simplified Onboarding**: Less technical jargon reduces cognitive load during the critical first-user experience.
4. **Market Positioning**: Differentiates from competitors (Strava, TrainingPeaks) who lead with data/metrics rather than personalization.

**Implementation Notes**:
- Used in onboarding flow (welcome screen, RPE education, "How It Works")
- A/B test planned for Q1 2025 to validate against Variant A with analytics cohorts
- Feature flag: `onboardingCopy` → defaults to `'B'`
- Copy can be hotswapped without code changes via feature flag toggle

**Related Story IDs**: STREAM3-007

---

## Decision Timeline

| Date | Decision | Stakeholders |
|------|----------|--------------|
| 2025-01-15 | Storybook demos completed for all variants | Stream 3 Dev Team |
| 2025-01-18 | Product/Design review session (Marisa, Avery) | Product, Design |
| 2025-01-19 | CoachTip Variant B selected | Product, Design, Science |
| 2025-01-20 | Weekly Review hybrid model proposed | Product, Dev |
| 2025-01-21 | Onboarding Copy Variant B selected | Product, Marketing |
| 2025-01-21 | Integration complete, PR opened | Stream 3 Dev Team |

---

## CoachTip Component

### Design Challenge

How do we surface adaptive coaching insights without overwhelming users or disrupting their workflow?

### Variant A: Traditional Tooltip

**Design Rationale:**
- Familiar pattern (banner/alert style) that users recognize
- Minimal visual weight - doesn't dominate the interface
- Quick to scan, easy to dismiss
- Works well for frequent, low-priority tips

**Strengths:**
- ✅ Non-intrusive
- ✅ Fast to read
- ✅ Predictable behavior
- ✅ Works well in sidebars or within content flow

**Weaknesses:**
- ⚠️ Less visually engaging
- ⚠️ May be overlooked if users develop "banner blindness"
- ⚠️ Limited space for context (RPE badges, etc.)

**Best Use Cases:**
- Quick contextual hints
- Micro-tips during workout logging
- System notifications
- Frequent, repeating tips

### Variant B: Modern Card

**Design Rationale:**
- Emphasizes the "AI coach" value proposition
- Gradient design creates premium, modern feel
- RPE context badges highlight adaptive intelligence
- Strong visual hierarchy draws attention to important insights

**Strengths:**
- ✅ High engagement potential
- ✅ Showcases adaptive/personalized nature
- ✅ RPE context makes insights more credible
- ✅ Action CTAs more prominent

**Weaknesses:**
- ⚠️ Higher visual weight - can feel heavy if overused
- ⚠️ Takes more screen real estate
- ⚠️ May slow down users looking for quick info

**Best Use Cases:**
- Key adaptive recommendations (deload weeks, PR attempts)
- Weekly/milestone insights
- Onboarding education
- High-value, infrequent tips

---

## Weekly Review Page

### Design Challenge

How do we help users understand their training progress in a way that's both comprehensive and motivating?

### Variant A: Traditional Dashboard

**Design Rationale:**
- Data-first approach for analytical users
- Table-based trends enable detailed comparisons
- Metrics grid provides at-a-glance summary
- Familiar dashboard pattern (ala Strava, TrainingPeaks)

**Strengths:**
- ✅ Comprehensive data view
- ✅ Easy to compare week-over-week trends
- ✅ Professional, credible appearance
- ✅ Familiar to quantified-self users

**Weaknesses:**
- ⚠️ Can feel clinical/dry
- ⚠️ May not inspire less data-focused users
- ⚠️ Narrative/story less clear
- ⚠️ Highlights list can be overlooked

**Best Use Cases:**
- Power users who track detailed metrics
- Post-workout analysis sessions
- Historical performance reviews
- Export/reporting scenarios

### Variant B: Visual Story Format

**Design Rationale:**
- Narrative approach emphasizes personal journey
- Gradient hero section creates emotional engagement
- Card-based insights feel like "coach highlights"
- Progressive disclosure (hero → insights → CTA) guides attention

**Strengths:**
- ✅ More emotionally engaging
- ✅ Clearer story arc (hero → performance → wins → action)
- ✅ Highlights stand out with numbered format
- ✅ Feels more "coach-like" and personal

**Weaknesses:**
- ⚠️ Less detailed trend data visible
- ⚠️ Requires more vertical scrolling
- ⚠️ May feel "too flashy" for serious athletes
- ⚠️ Harder to quickly compare specific metrics

**Best Use Cases:**
- Weekly digest emails (visual format)
- Onboarding period (building habit)
- Celebration moments (PR weeks, milestones)
- Mobile-first users

---

## Onboarding Copy

### Design Challenge

How do we communicate the value of RPE-based adaptive training to first-time users?

### Variant A: Technical/Data-driven

**Design Rationale:**
- Appeals to evidence-based, analytical users
- Emphasizes the "why" (40% accuracy improvement)
- Uses precise language (algorithms, metrics, calculations)
- Positions as a tool for optimization

**Strengths:**
- ✅ Credible for skeptical users
- ✅ Sets accurate expectations
- ✅ Appeals to quantified-self segment
- ✅ Differentiates via technical sophistication

**Weaknesses:**
- ⚠️ May feel impersonal
- ⚠️ Could intimidate less technical users
- ⚠️ Focuses more on "what" than "why it matters to you"

**Best Audience:**
- CrossFit/powerlifting communities
- Users with prior training experience
- Tech-savvy, metrics-focused users

### Variant B: Personalized/Adaptive

**Design Rationale:**
- Humanizes the AI ("your coach")
- Emphasizes partnership ("learns your body")
- Uses benefit-focused language (adapt to life, get stronger)
- Positions as a relationship, not a tool

**Strengths:**
- ✅ More emotionally resonant
- ✅ Easier to understand for non-technical users
- ✅ Emphasizes unique adaptive value prop
- ✅ Builds trust through coaching metaphor

**Weaknesses:**
- ⚠️ May feel overpromising to skeptics
- ⚠️ Less specific about methodology
- ⚠️ Could set unrealistic expectations

**Best Audience:**
- General fitness enthusiasts
- Users new to structured training
- Relationship-motivated users
- Mobile-first, casual users

---

## Accessibility Considerations

All variants were designed with WCAG 2.1 Level AA compliance:

1. **Color Contrast**
   - All text meets 4.5:1 contrast ratio
   - Variant B gradients tested with overlay text

2. **Keyboard Navigation**
   - All interactive elements are keyboard-accessible
   - Focus indicators clearly visible
   - Logical tab order maintained

3. **Screen Readers**
   - Semantic HTML used throughout
   - ARIA labels on icon-only buttons
   - `aria-live` regions for dynamic tips
   - Proper heading hierarchy

4. **Responsive Design**
   - All variants tested on mobile (375px) to desktop (1920px)
   - Touch targets ≥44x44px
   - No horizontal scrolling required

---

## Technical Tradeoffs

### Feature Flag System

**Decision:** Build lightweight custom hook vs integrate LaunchDarkly immediately

**Rationale:**
- Faster prototyping without external dependencies
- No cost during evaluation phase
- Easy to replace later (interface-compatible)

**Tradeoff:** Need to manually manage variant distribution (LaunchDarkly handles automatically)

### Component Architecture

**Decision:** Separate VariantA/VariantB components vs single component with props

**Rationale:**
- Cleaner separation of concerns
- Easier to compare variants side-by-side in Storybook
- Simpler to remove losing variants later

**Tradeoff:** Slight code duplication (mitigated by shared types)

---

## Measurement & Success Criteria

### Qualitative Metrics

- [ ] Product/design team preference survey
- [ ] Usability testing session feedback
- [ ] Brand/accessibility review signoff

### Quantitative Metrics (if A/B tested)

| Metric | Variant A Target | Variant B Target |
|--------|------------------|------------------|
| CoachTip dismissal rate | <30% | <20% |
| CoachTip action click rate | >15% | >25% |
| Weekly Review view duration | >45s | >60s |
| Onboarding completion rate | >70% | >75% |

---

## Recommendation Framework

### Choose Variant A If:
- Target audience is highly analytical
- Users explicitly request more detailed data
- Mobile performance is critical (lighter weight)
- Frequent, repeating content needed

### Choose Variant B If:
- Goal is to differentiate via premium UX
- Emphasizing adaptive/AI features
- Onboarding/engagement is priority
- Visual storytelling resonates with user research

### Hybrid Approach:
- Use Variant B for key moments (weekly review, major insights)
- Use Variant A for frequent tips (session logging)
- Let users choose their preference in settings

---

## Open Questions

1. **Performance:** Does Variant B's gradient rendering impact low-end devices?
2. **Localization:** Do narrative-heavy variants translate well?
3. **Content Frequency:** How often should CoachTips appear without feeling spammy?
4. **Personalization:** Should variant preference itself be AI-driven?

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design: Data Visualization](https://material.io/design/communication/data-visualization.html)
- [Nielsen Norman Group: Banner Blindness](https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/)
- [Strava Activity Summaries](https://www.strava.com) (inspiration for Variant A)
- [Apple Fitness+ Weekly Summary](https://www.apple.com/apple-fitness-plus/) (inspiration for Variant B)
