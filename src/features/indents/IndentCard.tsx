import { FiClock, FiPhone, FiThumbsUp, FiTruck } from 'react-icons/fi';
import { AppCard } from '@/components/ui/AppCard';
import { RoutePins } from '@/components/ui/RoutePins';
import { formatShortDate, formatWeight } from '@/utils/format';
import type { Indent } from '@/types';

interface IndentCardProps {
  indent: Indent;
  index?: number;
  onOpen: (indent: Indent) => void;
}

/**
 * Compact load card: truck meta row on top, numbered pin route, right-aligned
 * "I'm interested" thumbs-up affordance. Customer name/price intentionally
 * omitted — partner sees load spec only, per the visibility rules.
 */
export function IndentCard({ indent, index = 0, onOpen }: IndentCardProps) {
  return (
    <AppCard as="li" index={index} onClick={() => onOpen(indent)}>
      {/* Meta row */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="flex min-w-0 items-center gap-2 text-[12px] text-muted">
          <FiTruck size={14} className="shrink-0 text-content" />
          <span className="font-semibold text-content">{indent.vehicleType}</span>
          <span className="text-line">|</span>
          <FiClock size={11} className="shrink-0" />
          <span>{formatShortDate(indent.loadingDate)}</span>
        </div>
        <span className="tnum shrink-0 text-[12px] font-bold text-content">
          {formatWeight(indent.weightTon)}
        </span>
      </div>

      <p className="mt-1 px-4 text-[11px] text-faint">{indent.loadType}</p>

      {/* Route + quick actions */}
      <div className="flex items-center gap-3 px-4 py-3">
        <RoutePins
          className="flex-1"
          compact
          origin={indent.origin}
          destination={indent.destination}
        />
        <div className="flex shrink-0 flex-col gap-2">
          {indent.contactMobile && (
            <a
              href={`tel:${indent.contactMobile}`}
              onClick={(event) => event.stopPropagation()}
              aria-label="Call ops"
              className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success transition-colors hover:bg-success/25"
            >
              <FiPhone size={15} />
            </a>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(indent);
            }}
            aria-label="View and mark interest"
            className="pressable flex h-10 w-10 items-center justify-center rounded-xl border border-line/70 bg-surface-alt/60 text-muted transition-colors hover:border-brand hover:text-brand"
          >
            <FiThumbsUp size={15} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-line/70 bg-surface-alt/30 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-faint">#{indent.reference}</span>
        <span className="text-[11px] font-semibold text-brand">View details →</span>
      </div>
    </AppCard>
  );
}
