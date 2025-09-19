import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PlanFeedbackPanel, { TrainingAdjustment } from '@/components/feedback/PlanFeedbackPanel';

const adjustments: TrainingAdjustment[] = [
  { type: 'intensity', originalValue: 100, adjustedValue: 95, reason: 'High fatigue detected', confidence: 0.85, exerciseName: 'Squat', id: 'adj-1' },
  { type: 'volume', originalValue: 5, adjustedValue: 4, reason: 'Reduce volume', confidence: 0.7, exerciseName: 'Bench Press', id: 'adj-2' },
];

describe('PlanFeedbackPanel edge cases', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <PlanFeedbackPanel adjustments={adjustments} onFeedback={jest.fn()} onClose={jest.fn()} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('handles rapid rating clicks and only last selection is used', () => {
    const onFeedback = jest.fn();
    render(<PlanFeedbackPanel adjustments={adjustments} onFeedback={onFeedback} onClose={jest.fn()} isOpen />);

    // Open first item feedback
    const applyButtons = screen.getAllByRole('button', { name: /apply & rate/i });
    fireEvent.click(applyButtons[0]);

    // Rapid clicks on ratings 1..5, final selection 4
    const ratingButtons = screen.getAllByRole('button', { name: /Set satisfaction/ });
    fireEvent.click(ratingButtons[0]);
    fireEvent.click(ratingButtons[1]);
    fireEvent.click(ratingButtons[2]);
    fireEvent.click(ratingButtons[3]);

    // Submit should be enabled now; submit
    const submit = screen.getByRole('button', { name: /submit feedback/i });
    fireEvent.click(submit);

    expect(onFeedback).toHaveBeenCalledTimes(1);
    const [key, score] = onFeedback.mock.calls[0];
    expect(score).toBe(4);
  });

  it('closes feedback section after submit and resets state', () => {
    const onFeedback = jest.fn();
    render(<PlanFeedbackPanel adjustments={adjustments} onFeedback={onFeedback} onClose={jest.fn()} isOpen />);

    fireEvent.click(screen.getAllByRole('button', { name: /apply & rate/i })[1]);
    const ratingButtons = screen.getAllByRole('button', { name: /Set satisfaction/ });
    fireEvent.click(ratingButtons[4]);
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    // Feedback controls should disappear after submit (closed)
    expect(screen.queryByText(/Rate this adjustment/i)).toBeNull();
    expect(onFeedback).toHaveBeenCalledTimes(1);
  });
});

