import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder block used while a query is in flight. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-lg bg-line/60 dark:bg-white/5',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
        'dark:after:via-white/10',
        className,
      )}
    />
  );
}

/** Matches the height and rhythm of a real indent card to avoid layout shift. */
export function IndentCardSkeleton() {
  return (
    <div className="card-base space-y-4 p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-4 w-28" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <Skeleton className="h-7 w-16 rounded-pill" />
        <Skeleton className="h-11 w-11 rounded-2xl" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <IndentCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="card-base divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center justify-between p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
