import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppButton } from './ui/AppButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Two PWA affordances in one strip: an install prompt on first eligible visit,
 * and a reload prompt when a new service worker is waiting.
 */
export function PwaPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Suppress Chrome's default mini-infobar so we can place our own.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', () => setInstallEvent(null));

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const showInstall = Boolean(installEvent) && !dismissed && !needRefresh;
  const visible = needRefresh || showInstall;

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          role="status"
          className="fixed inset-x-0 bottom-0 z-[55] px-4 pb-safe"
        >
          <div className="mx-auto mb-4 flex w-full max-w-md items-center gap-3 rounded-2xl bg-navy p-4 text-white shadow-xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand">
              {needRefresh ? <FiRefreshCw size={18} /> : <FiDownload size={18} />}
            </span>

            <p className="flex-1 text-[12px] font-semibold leading-snug">
              {needRefresh
                ? 'A new version is ready.'
                : 'Install TripleA Partner for offline access.'}
            </p>

            <AppButton
              size="sm"
              onClick={() => (needRefresh ? void updateServiceWorker(true) : void handleInstall())}
            >
              {needRefresh ? 'Reload' : 'Install'}
            </AppButton>

            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => (needRefresh ? setNeedRefresh(false) : setDismissed(true))}
              className="shrink-0 rounded-full p-1 text-white/60 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
