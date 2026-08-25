import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AppButton } from '@/components/ui/AppButton';
import { OTPInput } from '@/components/ui/OTPInput';
import { MOBILE_LENGTH, OTP_LENGTH } from '@/constants';
import { useHaptics } from '@/hooks/useHaptics';
import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { formatMobile, formatMobileInput } from '@/utils/format';
import type { ApiFailure } from '@/types';

interface ChangeMobileModalProps {
  open: boolean;
  onClose: () => void;
}

/** Two-step OTP-gated mobile number change. */
export function ChangeMobileModal({ open, onClose }: ChangeMobileModalProps) {
  const setPartner = useAuthStore((state) => state.setPartner);
  const pushToast = useUiStore((state) => state.pushToast);
  const { success, error: errorHaptic } = useHaptics();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [digits, setDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep('mobile');
    setDigits('');
    setOtp('');
    setChallengeId('');
    setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const requestCode = async () => {
    setBusy(true);
    try {
      const { challengeId: id } = await profileService.requestMobileChange(digits);
      setChallengeId(id);
      setStep('otp');
    } catch (caught) {
      errorHaptic();
      pushToast((caught as ApiFailure).message ?? 'Could not send the code.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (code: string = otp) => {
    setBusy(true);
    try {
      const partner = await profileService.confirmMobileChange(challengeId, digits, code);
      success();
      setPartner(partner);
      pushToast(`Mobile number updated to ${formatMobile(partner.mobile)}.`, 'success');
      handleClose();
    } catch (caught) {
      errorHaptic();
      setOtp('');
      pushToast((caught as ApiFailure).message ?? 'That code was not right.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change mobile number"
      footer={
        step === 'mobile' ? (
          <AppButton
            fullWidth
            disabled={digits.length !== MOBILE_LENGTH}
            loading={busy}
            onClick={() => void requestCode()}
          >
            Send code
          </AppButton>
        ) : (
          <div className="flex gap-3">
            <AppButton variant="secondary" fullWidth onClick={() => setStep('mobile')}>
              Back
            </AppButton>
            <AppButton
              fullWidth
              disabled={otp.length !== OTP_LENGTH}
              loading={busy}
              onClick={() => void confirm()}
            >
              Confirm
            </AppButton>
          </div>
        )
      }
    >
      {step === 'mobile' ? (
        <div>
          <label
            htmlFor="new-mobile"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-faint"
          >
            New mobile number
          </label>
          <div className="flex h-[54px] items-center rounded-2xl bg-surface px-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-brand">
            <span className="text-[13px] font-extrabold text-content">+91</span>
            <span aria-hidden className="mx-3 h-5 w-px bg-line" />
            <input
              id="new-mobile"
              value={formatMobileInput(digits)}
              onChange={(event) =>
                setDigits(event.target.value.replace(/\D/g, '').slice(0, MOBILE_LENGTH))
              }
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-content outline-none placeholder:font-medium placeholder:text-faint"
            />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            We&rsquo;ll send a 6-digit code to this number. You&rsquo;ll use it to sign in from
            now on.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-[12px] text-muted">
            Enter the code sent to {formatMobile(digits)}
          </p>
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={(code) => void confirm(code)}
            disabled={busy}
          />
        </div>
      )}
    </Modal>
  );
}
