import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SplashScreen } from '@capacitor/splash-screen';
import logoMark from '@/assets/logos/mark-512.png';
import { APP_NAME, ROUTES, STORAGE_KEYS } from '@/constants';
import { storage } from '@/services/storage.service';
import { useAuthStore } from '@/store/auth.store';

/**
 * Brand screen shown while the stored session is read. Decides between the
 * onboarding carousel, the login flow and the authenticated app.
 */
export function SplashPage() {
  const navigate = useNavigate();
  const { hydrated, status } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    void (async () => {
      const seenOnboarding = await storage.get<boolean>(STORAGE_KEYS.onboardingSeen);
      // Hold the brand frame briefly so the transition never feels like a flash.
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (cancelled) return;

      void SplashScreen.hide().catch(() => {});

      if (status === 'authenticated') {
        navigate(ROUTES.indents, { replace: true });
      } else if (seenOnboarding) {
        navigate(ROUTES.login, { replace: true });
      } else {
        navigate(ROUTES.onboarding, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, status, navigate]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-navy px-8">
      <motion.img
        src={logoMark}
        alt={APP_NAME}
        width={132}
        height={132}
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="h-[132px] w-[132px] object-contain"
      />

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-7 text-[16px] font-extrabold tracking-tight text-white"
      >
        {APP_NAME}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.3em] text-brand"
      >
        Partner
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-16 flex gap-1.5"
        aria-label="Loading"
        role="status"
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full bg-brand"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
