import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'call';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  // The disabled treatment matches the muted "Continue" button in the design.
  primary:
    'bg-brand text-white shadow-sm enabled:hover:bg-brand-600 disabled:bg-line disabled:text-faint',
  secondary:
    'bg-card text-content border border-line enabled:hover:bg-surface-alt disabled:opacity-50',
  ghost: 'bg-transparent text-brand enabled:hover:bg-brand-50 dark:enabled:hover:bg-brand-900/20',
  danger:
    'bg-danger/10 text-danger enabled:hover:bg-danger/15 dark:bg-danger/15 disabled:opacity-50',
  call: 'bg-info text-white enabled:hover:bg-blue-700 disabled:opacity-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-12 px-5 text-[12px] rounded-2xl gap-2',
  lg: 'h-14 px-6 text-base rounded-2xl gap-2',
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'pressable inline-flex select-none items-center justify-center font-bold',
        'transition-colors duration-200 disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          className={cn('h-5 w-5', variant === 'primary' || variant === 'call' ? 'text-white' : '')}
        />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});
