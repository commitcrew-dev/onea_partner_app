import { motion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { useScrollReset } from '@/hooks/useScrollReset';
import { AppHeader } from './AppHeader';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  /** Sticky action bar pinned above the safe area, e.g. "Verify & Continue". */
  footer?: ReactNode;
  /** Set false for screens that manage their own padding, like full-bleed lists. */
  padded?: boolean;
  contentClassName?: string;
}

/**
 * Standard screen chrome: header, scrollable body, optional pinned footer.
 * The body is capped and centred so tablet and desktop do not stretch content.
 */
export function PageLayout({
  children,
  title,
  showBack,
  onBack,
  headerRight,
  footer,
  padded = true,
  contentClassName,
}: PageLayoutProps) {
  const scrollRef = useRef<HTMLElement>(null);
  useScrollReset(scrollRef);

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <AppHeader title={title} showBack={showBack} onBack={onBack} right={headerRight} />

      <motion.main
        ref={scrollRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className={cn('scroll-area min-h-0 flex-1 overflow-y-auto px-safe', contentClassName)}
      >
        <div className={cn('mx-auto w-full max-w-2xl', padded && 'px-4 py-5')}>{children}</div>
      </motion.main>

      {footer && (
        <div className="shrink-0 border-t border-line/60 bg-surface px-safe pb-safe">
          <div className="mx-auto w-full max-w-2xl px-4 py-3">{footer}</div>
        </div>
      )}
    </div>
  );
}
