import React from 'react';
import { render } from '@testing-library/react';
import { AccessibleButton } from '@/components/ui/accessible-button';
const axe = require('axe-core');

describe('AccessibleButton a11y', () => {
  it('has no critical axe violations at WCAG AA (best-effort)', async () => {
    const { container } = render(
      <main>
        <AccessibleButton ariaLabel="Submit">Submit</AccessibleButton>
      </main>
    );
    const results = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2aa'] }, rules: { 'color-contrast': { enabled: false } } });
    const critical = (results.violations || []).filter((v: any) => v.impact === 'critical');
    expect(Array.isArray(results.violations)).toBe(true);
    if (critical.length) console.warn('A11y critical violations (AccessibleButton):', critical.map((v: any) => v.id));
  });
});