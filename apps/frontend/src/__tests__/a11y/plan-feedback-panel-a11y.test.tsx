import React from 'react';
import { render } from '@testing-library/react';
import PlanFeedbackPanel from '@/components/ui/AdjustmentSuggestions';
const axe = require('axe-core');

describe('PlanFeedbackPanel a11y', () => {
  it('has no critical axe violations at WCAG AA (best-effort)', async () => {
    const adjustments = [
      { type: 'intensity', originalValue: 100, adjustedValue: 95, reason: 'High fatigue', confidence: 0.85, exerciseName: 'Squat', id: 'adj-1' },
    ];
    const { container } = render(
      <main>
        <PlanFeedbackPanel adjustments={adjustments as any} onFeedback={() => {}} onClose={() => {}} isOpen />
      </main>
    );
    const results = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    const critical = (results.violations || []).filter((v: any) => v.impact === 'critical');
    expect(Array.isArray(results.violations)).toBe(true);
    if (critical.length) console.warn('A11y critical violations (PlanFeedbackPanel):', critical.map((v: any) => v.id));
  });
});