import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { cn } from '@/utils/cn';
import { formatDateTime } from '@/utils/format';
import type { TripTimelineEntry } from '@/types';

interface TimelineProps {
  entries: TripTimelineEntry[];
}

/**
 * Horizontal trip stepper — one node per trip_status row, connected by a
 * coloured rail. Overflows to horizontal scroll on narrow viewports so the
 * seven-step chain never squashes.
 */
export function Timeline({ entries }: TimelineProps) {
  return (
    <div className="scroll-area -mx-4 overflow-x-auto px-4 pb-1">
      <ol
        className="relative isolate flex min-w-full items-start"
        style={{ minWidth: `${entries.length * 84}px` }}
      >
        {entries.map((entry, index) => {
          const isFirst = index === 0;
          const isLast = index === entries.length - 1;
          const prev = entries[index - 1];
          const next = entries[index + 1];

          // Left half of the connector paints if this and the previous step are both complete.
          const leftFilled = !isFirst && entry.complete && prev?.complete;
          // Right half paints if the next step is complete (or currently active).
          const rightFilled = !isLast && next?.complete;

          return (
            <li
              key={entry.id ?? entry.status}
              className="relative flex min-w-[80px] flex-1 flex-col items-center"
            >
              {/* Left half of the connector — hidden on first step */}
              {!isFirst && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-[12px] h-[2px] w-1/2 rounded-full',
                    leftFilled ? 'bg-brand' : 'bg-line',
                  )}
                />
              )}
              {/* Right half of the connector — hidden on last step */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute right-0 top-[12px] h-[2px] w-1/2 rounded-full',
                    rightFilled ? 'bg-brand' : 'bg-line',
                  )}
                />
              )}

              {/* Node */}
              <motion.span
                aria-hidden
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  damping: 20,
                  stiffness: 320,
                }}
                className={cn(
                  'relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
                  entry.complete && !entry.current && 'bg-brand text-white shadow-sm shadow-brand/30',
                  entry.current &&
                    'bg-brand text-white ring-4 ring-brand/20 shadow-md shadow-brand/40',
                  !entry.complete && !entry.current && 'border-2 border-line bg-card text-faint',
                )}
              >
                {entry.complete && !entry.current ? (
                  <FiCheck size={13} strokeWidth={3} />
                ) : (
                  entry.id ?? index + 1
                )}
              </motion.span>

              {/* Label + timestamp — clipped so long words like "Waiting For Load" wrap */}
              <p
                className={cn(
                  'mt-2 max-w-[76px] text-center text-[11px] leading-tight',
                  entry.current
                    ? 'font-bold text-brand'
                    : entry.complete
                      ? 'font-semibold text-content'
                      : 'font-medium text-muted',
                )}
              >
                {entry.label}
              </p>

              {entry.at ? (
                <p className="mt-1 text-center text-[10px] text-faint">
                  {formatDateTime(entry.at)}
                </p>
              ) : (
                <p className="mt-1 text-center text-[10px] text-faint">
                  {entry.current ? 'In progress' : entry.complete ? '—' : 'Pending'}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
