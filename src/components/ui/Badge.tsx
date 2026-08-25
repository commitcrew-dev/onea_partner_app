import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import {
  DOCUMENT_STATUS_LABEL,
  INDENT_STATUS_LABEL,
  TRIP_STATUS_LABEL,
  TRUCK_STATUS_LABEL,
} from '@/constants';
import type { DocumentStatus, IndentStatus, TripStatus, TruckStatus } from '@/types';

type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
  neutral: 'bg-surface-alt text-faint dark:bg-white/5 dark:text-muted',
  success: 'bg-success/15 text-success dark:bg-success/20',
  warning: 'bg-warning/20 text-amber-700 dark:bg-warning/20 dark:text-warning',
  danger: 'bg-danger/10 text-danger dark:bg-danger/20',
  info: 'bg-info/10 text-info dark:bg-info/20',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  /** `solid` is the filled amber pill used for a trip's live status. */
  variant?: 'soft' | 'solid';
  className?: string;
}

export function Badge({ children, tone = 'neutral', variant = 'soft', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-bold leading-none',
        variant === 'solid' ? 'bg-warning text-white' : TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const INDENT_TONE: Record<IndentStatus, Tone> = {
  open: 'brand',
  assigned: 'neutral',
  closed: 'neutral',
};

export function IndentStatusBadge({ status }: { status: IndentStatus }) {
  return <Badge tone={INDENT_TONE[status]}>{INDENT_STATUS_LABEL[status]}</Badge>;
}

export function TripStatusBadge({
  status,
  label,
}: {
  status: TripStatus;
  /** Optional DB label (trip.trip_status.name). Preferred over the frontend fallback. */
  label?: string | null;
}) {
  const text = label || TRIP_STATUS_LABEL[status];
  if (status === 'in-transit' || status === 'started') {
    return <Badge variant="solid">{text}</Badge>;
  }
  const tone: Tone =
    status === 'delivered' ? 'success' : status === 'cancelled' ? 'danger' : 'neutral';
  return <Badge tone={tone}>{text}</Badge>;
}

const TRUCK_TONE: Record<TruckStatus, Tone> = {
  'waiting-for-load': 'success',
  'on-trip': 'info',
  unloading: 'neutral',
  maintenance: 'warning',
};

export function TruckStatusBadge({ status }: { status: TruckStatus }) {
  return <Badge tone={TRUCK_TONE[status]}>{TRUCK_STATUS_LABEL[status]}</Badge>;
}

const DOCUMENT_TONE: Record<DocumentStatus, Tone> = {
  verified: 'success',
  pending: 'warning',
  expired: 'danger',
  rejected: 'danger',
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge tone={DOCUMENT_TONE[status]}>{DOCUMENT_STATUS_LABEL[status]}</Badge>;
}
