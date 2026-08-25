import { AnimatePresence, motion } from 'framer-motion';
import { FiWifiOff } from 'react-icons/fi';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Persistent strip shown whenever the device drops offline. Cached React Query
 * data keeps rendering underneath, so the app stays usable.
 */
export function OfflineBanner() {
  const { online } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="status"
          aria-live="polite"
          className="shrink-0 overflow-hidden bg-navy-900 text-white"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold">
            <FiWifiOff size={15} aria-hidden />
            <span>You&rsquo;re offline — showing saved data</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
