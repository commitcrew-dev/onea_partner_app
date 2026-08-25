import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { OTPInput } from '@/components/ui/OTPInput';
import { SuccessAnimation } from '@/components/ui/SuccessAnimation';
import { OTP_LENGTH, OTP_RESEND_SECONDS, ROUTES } from '@/constants';
import { useCountdown } from '@/hooks/useCountdown';
import { useHaptics } from '@/hooks/useHaptics';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { formatMobile } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { ApiFailure } from '@/types';

export function OtpPage() {
  const navigate = useNavigate();
  const { challenge, pendingMobile, signIn } = useAuthStore();
  const pushToast = useUiStore((state) => state.pushToast);
  const { success, error: errorHaptic, impact } = useHaptics();
  const { seconds, running, restart } = useCountdown(OTP_RESEND_SECONDS);

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (hasError && otp.length < OTP_LENGTH) setHasError(false);
  }, [otp, hasError]);

  if (!challenge) return <Navigate to={ROUTES.login} replace />;

  const handleVerify = async (code: string = otp) => {
    if (code.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    setHasError(false);

    try {
      const outcome = await authService.verifyOtp(challenge.challengeId, pendingMobile, code);
      if (outcome.result === 'success') {
        success();
        setVerified(true);
        await signIn(outcome.tokens, outcome.partner);
        setTimeout(() => navigate(ROUTES.indents, { replace: true }), 900);
        return;
      }
      if (outcome.result === 'not-registered') {
        navigate(ROUTES.notRegistered, { replace: true });
        return;
      }
      setHasError(true);
      setOtp('');
      errorHaptic();
      pushToast(
        outcome.attemptsRemaining > 0
          ? `Incorrect code. ${outcome.attemptsRemaining} attempt${outcome.attemptsRemaining === 1 ? '' : 's'} left.`
          : 'Incorrect code.',
        'error',
      );
    } catch (caught) {
      setHasError(true);
      errorHaptic();
      pushToast((caught as ApiFailure).message ?? 'Verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (running || resending) return;
    setResending(true);
    impact();
    try {
      await authService.resendOtp(challenge.challengeId, pendingMobile);
      restart(OTP_RESEND_SECONDS);
      setOtp('');
      setHasError(false);
      pushToast('A new code is on its way.', 'success');
    } catch (caught) {
      pushToast((caught as ApiFailure).message ?? 'Could not resend the code.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col bg-surface pt-safe pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          aria-label="Go back"
          className="pressable flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card text-content"
        >
          <FiArrowLeft size={18} />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col px-6">
        <div className="mx-auto w-full max-w-sm">
          <AnimatePresence mode="wait">
            {verified ? (
              <motion.div
                key="verified"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-20 text-center"
              >
                <SuccessAnimation label="Verified" />
                <h1 className="mt-6 text-[16px] font-bold text-content">Verified</h1>
                <p className="mt-1.5 text-[12px] text-muted">Signing you in…</p>
              </motion.div>
            ) : (
              <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand">
                  <FiMessageSquare size={22} />
                </div>

                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-content">
                  Enter the code
                </h1>
                <p className="mt-2 text-[13px] text-muted">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-content">
                    {formatMobile(pendingMobile)}
                  </span>
                </p>

                <div className="mt-8">
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={(code) => void handleVerify(code)}
                    disabled={verifying}
                    error={hasError}
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-[12px] text-muted">Didn&apos;t get it?</p>
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={running || resending}
                    className="text-[12px] font-bold text-brand transition-opacity disabled:cursor-not-allowed disabled:text-faint"
                  >
                    {resending ? 'Sending…' : running ? `Resend in ${seconds}s` : 'Resend code'}
                  </button>
                </div>

                <motion.button
                  type="button"
                  onClick={() => void handleVerify()}
                  disabled={otp.length !== OTP_LENGTH || verifying}
                  whileTap={{ scale: otp.length === OTP_LENGTH ? 0.97 : 1 }}
                  className={cn(
                    'mt-8 flex h-[54px] w-full items-center justify-center rounded-2xl text-[14px] font-bold transition-all',
                    otp.length === OTP_LENGTH && !verifying
                      ? 'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-600'
                      : 'bg-surface-alt text-faint',
                  )}
                >
                  {verifying ? 'Verifying…' : 'Verify & Continue'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
