import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useUiStore, type Toast as ToastModel } from '@/store/ui.store';

const ICONS = {
  success: <FiCheckCircle className="text-success" size={19} />,
  error: <FiAlertCircle className="text-danger" size={19} />,
  info: <FiInfo className="text-info" size={19} />,
};

function ToastItem({ toast }: { toast: ToastModel }) {
  const dismiss = useUiStore((state) => state.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 3200);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ type: 'spring', damping: 26, stiffness: 340 }}
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-card p-3.5 shadow-xl ring-1 ring-line"
    >
      <span className="mt-px shrink-0">{ICONS[toast.tone]}</span>
      <p className="flex-1 text-[12px] font-semibold leading-snug text-content">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 text-[11px] font-bold text-muted hover:text-content"
      >
        Dismiss
      </button>
    </motion.div>
  );
}

/** Single global toast viewport, mounted once by the root layout. */
export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-safe">
      <div className="flex w-full flex-col items-center gap-2 pt-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}
