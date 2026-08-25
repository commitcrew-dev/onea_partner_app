import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield } from 'react-icons/fi';
import logoMark from '@/assets/logos/mark-512.png';
import { MOBILE_LENGTH, ROUTES } from '@/constants';
import { useHaptics } from '@/hooks/useHaptics';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { formatMobileInput } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { ApiFailure } from '@/types';

export function LoginPage() {
  const navigate = useNavigate();
  const setChallenge = useAuthStore((state) => state.setChallenge);
  const pushToast = useUiStore((state) => state.pushToast);
  const { impact, error: errorHaptic } = useHaptics();

  const [digits, setDigits] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = digits.length === MOBILE_LENGTH;
  const canSubmit = complete && agreed && !submitting;

  const handleChange = (raw: string) => {
    setDigits(raw.replace(/\D/g, '').slice(0, MOBILE_LENGTH));
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!/^[6-9]/.test(digits)) {
      setError('Mobile numbers start with 6, 7, 8 or 9');
      errorHaptic();
      return;
    }

    setSubmitting(true);
    setError(null);
    impact();

    try {
      const challenge = await authService.requestOtp(digits);
      setChallenge(challenge, digits);
      navigate(ROUTES.otp);
    } catch (caught) {
      const failure = caught as ApiFailure;
      pushToast(failure.message ?? 'Could not send the code. Try again.', 'error');
      errorHaptic();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-surface pt-safe pb-safe">
      {/* Ambient brand-glow behind the top of the screen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-40 h-48 w-48 rounded-full bg-navy/15 blur-3xl"
      />

      <div className="relative flex flex-1 flex-col justify-center px-6">
        <div className="mx-auto w-full max-w-sm">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 260 }}
            className="mx-auto mb-6 flex h-[86px] w-[86px] items-center justify-center rounded-3xl bg-card shadow-xl shadow-brand/10 ring-1 ring-line/70"
          >
            <img src={logoMark} alt="TripleA Transport" className="h-14 w-14 object-contain" />
          </motion.div>

          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-brand">
            TripleA Transport
          </p>
          <h1 className="mt-2 text-center text-[24px] font-bold leading-tight tracking-tight text-content">
            Sign in to your <br />
            partner account
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-[13px] leading-relaxed text-muted">
            We&apos;ll send a one-time code to your registered mobile number.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
            className="mt-8"
          >
            <div
              className={cn(
                'flex h-[58px] items-center rounded-2xl bg-card px-4 shadow-sm ring-1 transition-colors',
                error
                  ? 'ring-2 ring-danger'
                  : 'ring-line focus-within:ring-2 focus-within:ring-brand',
              )}
            >
              <span className="rounded-lg bg-surface-alt px-2.5 py-1.5 text-[12px] font-bold text-content">
                +91
              </span>
              <input
                id="mobile"
                value={formatMobileInput(digits)}
                onChange={(event) => handleChange(event.target.value)}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                autoFocus
                placeholder="98765 43210"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'mobile-error' : undefined}
                className="ml-3 min-w-0 flex-1 bg-transparent text-[15px] font-semibold tracking-wide text-content outline-none placeholder:font-medium placeholder:text-faint"
              />
            </div>

            {error && (
              <motion.p
                id="mobile-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-[12px] font-semibold text-danger"
              >
                {error}
              </motion.p>
            )}

            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12px] text-muted">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span>
                I agree to the{' '}
                <span className="font-semibold text-brand">Terms &amp; Conditions</span>
              </span>
            </label>

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileTap={{ scale: canSubmit ? 0.97 : 1 }}
              className={cn(
                'mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold transition-all',
                canSubmit
                  ? 'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-600'
                  : 'bg-surface-alt text-faint',
              )}
            >
              {submitting ? 'Sending code…' : 'Send OTP'}
              {!submitting && <FiArrowRight size={16} />}
            </motion.button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-faint">
            <FiShield size={12} />
            Secured with mobile OTP verification
          </p>
        </div>
      </div>
    </div>
  );
}
