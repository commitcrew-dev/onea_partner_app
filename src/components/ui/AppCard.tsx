import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Stagger index — cards fade up in sequence as a list renders. */
  index?: number;
  as?: 'div' | 'li' | 'article';
}

export function AppCard({ children, className, onClick, index = 0, as = 'div' }: AppCardProps) {
  const interactive = Boolean(onClick);
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        // Cap the stagger so long lists never feel sluggish.
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        'card-base overflow-hidden',
        interactive && 'pressable cursor-pointer',
        className,
      )}
    >
      {children}
    </Component>
  );
}
