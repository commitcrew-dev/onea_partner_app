import { motion } from 'framer-motion';
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { OTP_LENGTH } from '@/constants';
import { cn } from '@/utils/cn';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once the final digit lands, so the caller can auto-submit. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

/**
 * Six separate boxes backed by one controlled string. Supports auto-advance,
 * backspace-to-previous, arrow navigation, and pasting a full code.
 */
export function OTPInput({
  value,
  onChange,
  onComplete,
  length = OTP_LENGTH,
  disabled = false,
  error = false,
  autoFocus = true,
}: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    inputsRef.current[clamped]?.focus();
    inputsRef.current[clamped]?.select();
  };

  const handleInput = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const chars = value.padEnd(length, ' ').split('');
    chars[index] = digit;
    const next = chars.join('').trimEnd();

    commit(next);
    if (index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const chars = value.padEnd(length, ' ').split('');

      if (chars[index] !== ' ' && chars[index] !== undefined) {
        // Clear the current box first; a second press moves back.
        chars[index] = ' ';
        commit(chars.join('').trimEnd());
      } else if (index > 0) {
        chars[index - 1] = ' ';
        commit(chars.join('').trimEnd());
        focusAt(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    commit(pasted);
    focusAt(pasted.length >= length ? length - 1 : pasted.length);
  };

  return (
    <motion.div
      // A short horizontal shake is the error signal on a rejected code.
      animate={error ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex gap-2.5"
    >
      {digits.map((digit, index) => {
        const filled = digit.trim() !== '';
        return (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            value={digit.trim()}
            onChange={(event) => handleInput(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${index + 1} of ${length}`}
            maxLength={1}
            className={cn(
              'h-[68px] w-full min-w-0 rounded-2xl bg-card text-center text-[16px] font-extrabold',
              'text-content caret-brand transition-all duration-150',
              'border-2 focus:outline-none disabled:opacity-60',
              error
                ? 'border-danger'
                : filled
                  ? 'border-brand'
                  : 'border-brand/45 focus:border-brand',
            )}
          />
        );
      })}
    </motion.div>
  );
}
