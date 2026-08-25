import { cn } from '@/utils/cn';

interface RoutePinsProps {
  origin: string;
  destination: string;
  originSub?: string;
  destinationSub?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Numbered vertical route: green "1" for origin, brand "2" for destination,
 * connected by a thin line. Matches the pattern common to logistics apps.
 */
export function RoutePins({
  origin,
  destination,
  originSub,
  destinationSub,
  className,
  compact = false,
}: RoutePinsProps) {
  const pinSize = compact ? 'h-[20px] w-[20px]' : 'h-[22px] w-[22px]';
  return (
    // `isolate` scopes the z-index of the pins so they never leak above the
    // sticky page header while the list scrolls.
    <div className={cn('relative isolate', className)}>
      {/* Dashed connecting line — softer than a solid rule */}
      <span
        aria-hidden
        className={cn(
          'absolute w-[2px] rounded-full bg-gradient-to-b from-success/80 via-warning/60 to-brand/80',
          compact ? 'left-[9px] top-[22px] bottom-[22px]' : 'left-[10px] top-[24px] bottom-[24px]',
        )}
      />

      <div className={cn('flex items-start gap-3', compact ? 'mb-3' : 'mb-4')}>
        <span
          aria-hidden
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-bold text-white shadow-md shadow-success/40 ring-4 ring-success/15',
            pinSize,
          )}
        >
          A
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-success">Pickup</p>
          <p
            className={cn(
              'mt-0.5 font-semibold text-content leading-tight',
              compact ? 'text-[13px]' : 'text-[14px]',
            )}
          >
            {origin}
          </p>
          {originSub && (
            <p className="mt-0.5 truncate text-[11px] text-faint">{originSub}</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-md shadow-brand/40 ring-4 ring-brand/15',
            pinSize,
          )}
        >
          B
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Drop</p>
          <p
            className={cn(
              'mt-0.5 font-semibold text-content leading-tight',
              compact ? 'text-[13px]' : 'text-[14px]',
            )}
          >
            {destination}
          </p>
          {destinationSub && (
            <p className="mt-0.5 truncate text-[11px] text-faint">{destinationSub}</p>
          )}
        </div>
      </div>
    </div>
  );
}
