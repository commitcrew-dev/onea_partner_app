import { useCallback, useEffect, useRef, useState } from 'react';

interface Countdown {
  /** Whole seconds remaining; reaches 0 and stops. */
  seconds: number;
  running: boolean;
  restart: (from?: number) => void;
}

/**
 * Counts down once per second. Used for the OTP resend cool-down, which is why
 * it exposes `restart` rather than a generic start/stop pair.
 */
export function useCountdown(initialSeconds: number): Countdown {
  const [seconds, setSeconds] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(
    (from: number = initialSeconds) => {
      clear();
      setSeconds(from);
      if (from <= 0) return;

      timerRef.current = setInterval(() => {
        setSeconds((current) => {
          if (current <= 1) {
            clear();
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    },
    [clear, initialSeconds],
  );

  useEffect(() => {
    restart(initialSeconds);
    return clear;
  }, [restart, clear, initialSeconds]);

  return { seconds, running: seconds > 0, restart };
}
