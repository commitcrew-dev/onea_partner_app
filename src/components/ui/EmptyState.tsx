import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { AppButton } from './AppButton';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center px-8 py-16 text-center"
    >
      <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-100 text-[18px] text-brand dark:bg-brand-900/25">
        {icon}
      </div>
      <h2 className="text-[13px] font-extrabold text-content">{title}</h2>
      <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-muted">{description}</p>
      {actionLabel && onAction && (
        <AppButton variant="secondary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </motion.div>
  );
}
