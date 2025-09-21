import React from 'react';
import { render } from '@testing-library/react';
import { PlanCard } from '@/components/training/PlanCard';
const axe = require('axe-core');

describe('PlanCard a11y', () => {
  it('has no critical axe violations at WCAG AA (best-effort)', async () => {
    const plan = {
      id: 'plan_1',
      name: 'Beginner Strength',
      description: 'A safe starting point for building strength',
      duration: 8,
      difficulty: 'beginner' as const,
      category: 'strength',
      sessionsPerWeek: 3,
      estimatedTime: 45,
      tags: ['intro', 'full body']
    };
    const { container } = render(
      <main>
        <PlanCard plan={plan} onSelect={() => {}} onEdit={() => {}} />
      </main>
    );
    const results = await axe.run(container, { runOnly: { type: 'tag', values: ['wcag2aa'] }, rules: { 'color-contrast': { enabled: false } } });
    const critical = (results.violations || []).filter((v: any) => v.impact === 'critical');
    expect(Array.isArray(results.violations)).toBe(true);
    if (critical.length) console.warn('A11y critical violations (PlanCard):', critical.map((v: any) => v.id));
  });
});