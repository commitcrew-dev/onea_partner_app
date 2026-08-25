import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  /** `dark` = navy sheet (default), `light` = surface/card for form-style sheets. */
  tone?: 'dark' | 'light';
}

/**
 * Bottom sheet with drag-to-dismiss. The drag is bound only to the top grabber
 * — dragging the body doesn't fire, so inputs inside stay usable.
 */
export function Sheet({ open, onClose, children, labelledBy, tone = 'dark' }: SheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            className={
              tone === 'light'
                ? 'relative flex max-h-[88vh] flex-col rounded-t-sheet bg-surface pb-safe shadow-sheet'
                : 'relative flex max-h-[88vh] flex-col rounded-t-sheet bg-navy pb-safe shadow-sheet'
            }
          >
            {/* Grabber is the only drag surface — inputs/buttons in the body stay untouched */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex cursor-grab justify-center pb-2 pt-3 active:cursor-grabbing"
              aria-hidden
            >
              <span
                className={
                  tone === 'light'
                    ? 'h-1 w-10 rounded-full bg-line'
                    : 'h-1 w-10 rounded-full bg-white/30'
                }
              />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
