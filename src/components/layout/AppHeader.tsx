import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import logoMark from '@/assets/logos/mark-512.png';
import { APP_NAME } from '@/constants';
import { cn } from '@/utils/cn';

interface AppHeaderProps {
  /** Omit to show the brand lockup instead of a page title. */
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

/**
 * Fixed navy header with the brand rule beneath it. Shows either the TripleA
 * lockup (tab roots) or a back button with the page title (detail screens).
 */
export function AppHeader({ title, showBack = false, onBack, right }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-header pt-safe">
      <div className="flex h-[60px] items-center gap-3 px-4">
        {showBack ? (
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            aria-label="Go back"
            className="pressable -ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white"
          >
            <FiChevronLeft size={24} />
          </button>
        ) : (
          <img
            src={logoMark}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain"
          />
        )}

        <h1
          className={cn(
            'min-w-0 flex-1 truncate text-[14px] font-semibold tracking-tight text-white',
            showBack && 'text-[13px]',
          )}
        >
          {title ?? APP_NAME}
        </h1>

        {right}
      </div>

      <motion.div
        className="header-rule"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </header>
  );
}

interface HeaderActionProps {
  onClick: () => void;
  label: string;
  children: ReactNode;
  /** Switches to the filled brand treatment, e.g. when filters are applied. */
  active?: boolean;
  badge?: number;
}

/** Square action button in the header — used by the indent filter control. */
export function HeaderAction({
  onClick,
  label,
  children,
  active = false,
  badge,
}: HeaderActionProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'pressable flex h-10 w-10 items-center justify-center rounded-xl text-[14px] transition-colors',
          active ? 'bg-brand text-white' : 'bg-brand-100 text-brand',
        )}
      >
        {children}
      </button>
      {badge !== undefined && badge > 0 && (
        <span className="pointer-events-none absolute -right-1 -top-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-info px-1 text-[11px] font-bold text-white ring-2 ring-header">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  );
}
