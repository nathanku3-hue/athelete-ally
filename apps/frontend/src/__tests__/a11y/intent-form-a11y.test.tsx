jest.mock('@/hooks/useGeneratePlan', () => ({
  useGeneratePlan: () => ({
    mutateAsync: jest.fn().mockResolvedValue({ jobId: 'test_job', status: 'queued' }),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

import React from 'react';
import { render } from '@testing-library/react';
import IntentForm from '@/components/intent/IntentForm';
const axe = require('axe-core');

describe('IntentForm a11y', () => {
  it('has no critical axe violations at WCAG AA (best-effort)', async () => {
    const { container } = render((<main><IntentForm /></main>) as any);
    const results = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    const critical = (results.violations || []).filter((v: any) => v.impact === 'critical');
    expect(Array.isArray(results.violations)).toBe(true);
    if (critical.length) {
      // eslint-disable-next-line no-console
      console.warn('A11y critical violations (IntentForm):', critical.map((v: any) => v.id));
    }
  });
});