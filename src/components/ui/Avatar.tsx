import { cn } from '@/utils/cn';

interface AvatarProps {
  initials: string;
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-9 w-9 text-sm rounded-xl',
  md: 'h-12 w-12 text-base rounded-2xl',
  lg: 'h-[68px] w-[68px] text-2xl rounded-[20px]',
};

/** Brand-orange tile with initials, falling back from an avatar image. */
export function Avatar({ initials, src, name, size = 'lg', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? initials}
        loading="lazy"
        decoding="async"
        className={cn('object-cover', SIZES[size], className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name ?? initials}
      className={cn(
        'flex shrink-0 select-none items-center justify-center bg-brand font-extrabold text-white',
        SIZES[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
