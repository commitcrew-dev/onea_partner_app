import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiPhone } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppButton } from '@/components/ui/AppButton';
import { ROUTES, SUPPORT_PHONE } from '@/constants';
import { useAuthStore } from '@/store/auth.store';
import { formatMobile } from '@/utils/format';

/**
 * Shown when a valid OTP belongs to a number with no partner account. The team
 * onboards partners manually, so the only actions are calling or retrying.
 */
export function NotRegisteredPage() {
  const navigate = useNavigate();
  const pendingMobile = useAuthStore((state) => state.pendingMobile);

  return (
    <PageLayout>
      <div className="flex flex-col items-center pt-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 240 }}
          className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-warning/15 text-warning"
        >
          <FiAlertCircle size={44} aria-hidden />
        </motion.div>

        <h1 className="mt-7 text-[23px] font-extrabold leading-tight tracking-tight text-content">
          You&rsquo;re not registered yet
        </h1>
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
          We couldn&rsquo;t find a partner account for {formatMobile(pendingMobile)}. Our team will
          reach out to you soon to complete onboarding.
        </p>

        <AppButton
          variant="call"
          size="lg"
          fullWidth
          className="mt-8"
          leftIcon={<FiPhone size={19} aria-hidden />}
          onClick={() => {
            window.location.href = `tel:${SUPPORT_PHONE}`;
          }}
        >
          Call Support
        </AppButton>

        <button
          type="button"
          onClick={() => navigate(ROUTES.login, { replace: true })}
          className="mt-5 py-2 text-[13px] font-semibold text-muted transition-colors hover:text-content"
        >
          Try another number
        </button>
      </div>
    </PageLayout>
  );
}
