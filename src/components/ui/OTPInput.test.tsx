import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { OTPInput } from './OTPInput';

/** Wraps the controlled input so tests can drive it like the real screen does. */
function Harness({ onComplete }: { onComplete?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return <OTPInput value={value} onChange={setValue} onComplete={onComplete} />;
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

describe('OTPInput', () => {
  it('renders six boxes and focuses the first', () => {
    render(<Harness />);
    expect(boxes()).toHaveLength(6);
    expect(boxes()[0]).toHaveFocus();
  });

  it('advances to the next box as digits are typed', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('98');

    expect(boxes()[0]).toHaveValue('9');
    expect(boxes()[1]).toHaveValue('8');
    expect(boxes()[2]).toHaveFocus();
  });

  it('ignores non-numeric input', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('a');

    expect(boxes()[0]).toHaveValue('');
  });

  it('clears the current box on backspace, then steps back', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('98');
    await user.keyboard('{Backspace}');
    // Box 2 was empty, so focus moves back and clears box 1.
    expect(boxes()[1]).toHaveValue('');
    expect(boxes()[1]).toHaveFocus();

    await user.keyboard('{Backspace}');
    expect(boxes()[0]).toHaveValue('');
  });

  it('distributes a pasted code across the boxes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    await user.click(boxes()[0]);
    await user.paste('987654');

    expect(boxes().map((box) => box.value)).toEqual(['9', '8', '7', '6', '5', '4']);
    expect(onComplete).toHaveBeenCalledWith('987654');
  });

  it('fires onComplete once the final digit is typed', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    await user.keyboard('98765');
    expect(onComplete).not.toHaveBeenCalled();

    await user.keyboard('4');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('987654');
  });

  it('moves between boxes with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('{ArrowRight}');
    expect(boxes()[1]).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(boxes()[0]).toHaveFocus();
  });
});
