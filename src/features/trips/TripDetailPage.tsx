import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiPackage, FiPhone, FiTruck } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { RoutePins } from '@/components/ui/RoutePins';
import { TripStatusBadge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { RowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Timeline } from '@/components/ui/Timeline';
import { queryKeys } from '@/api/queryClient';
import { tripService } from '@/services/trip.service';
import { cn } from '@/utils/cn';
import {
  formatCurrency,
  formatLongDate,
  formatSignedCurrency,
  formatWeight,
} from '@/utils/format';
import type { ReactNode } from 'react';

function SpecTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-line/70 bg-card p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{label}</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-content">{value}</p>
      </div>
    </div>
  );
}

function PayRow({
  label,
  value,
  tone = 'normal',
}: {
  label: string;
  value: string;
  tone?: 'normal' | 'muted' | 'danger' | 'strong';
}) {
  return (
    <div className="flex items-center justify-between border-b border-line/70 px-4 py-3 last:border-b-0">
      <span className={cn('text-[12px]', tone === 'strong' ? 'font-bold text-content' : 'text-muted')}>
        {label}
      </span>
      <span
        className={cn(
          'tnum text-[13px] font-semibold',
          tone === 'danger' && 'text-danger',
          tone === 'muted' && 'text-muted',
          tone === 'strong' && 'text-content',
          tone === 'normal' && 'text-content',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function TripDetailPage() {
  const { tripId = '' } = useParams();

  const query = useQuery({
    queryKey: queryKeys.trips.detail(tripId),
    queryFn: () => tripService.detail(tripId),
    enabled: Boolean(tripId),
  });

  if (query.isPending) {
    return (
      <PageLayout title="Trip" showBack>
        <Skeleton className="mb-4 h-9 w-56" />
        <Skeleton className="mb-5 h-56 w-full rounded-card" />
        <RowSkeleton count={5} />
      </PageLayout>
    );
  }

  if (query.isError) {
    return (
      <PageLayout title="Trip" showBack>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </PageLayout>
    );
  }

  const trip = query.data;
  const { payment } = trip;
  // Partner is view-only on a trip — status transitions are driven by the ops team.

  return (
    <PageLayout
      title={`${trip.reference} · ${trip.truckNumber}`}
      showBack
      padded={false}
      footer={
        trip.contactMobile ? (
          <motion.a
            href={`tel:${trip.contactMobile}`}
            whileTap={{ scale: 0.98 }}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[14px] font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-600"
          >
            <FiPhone size={16} />
            Call {trip.contactName || 'ops'}
          </motion.a>
        ) : null
      }
    >
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-6">
        {/* Route + status */}
        <div className="card-base p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
              <FiCalendar size={12} />
              {formatLongDate(trip.orderDate)}
            </div>
            <TripStatusBadge status={trip.status} label={trip.statusLabel} />
          </div>
          <RoutePins origin={trip.origin} destination={trip.destination} />
        </div>

        {/* Load spec */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <SpecTile icon={<FiTruck size={16} />} label="Truck" value={trip.truckNumber} />
          <SpecTile
            icon={<FiPackage size={16} />}
            label="Weight"
            value={formatWeight(trip.weightTon)}
          />
          <SpecTile icon={<FiPackage size={16} />} label="Load" value={trip.loadType} />
          <SpecTile icon={<FiTruck size={16} />} label="Vehicle" value={trip.vehicleType} />
        </div>

        {/* Timeline — mirrors trip.trip_status rows exactly */}
        <div className="mt-3 rounded-2xl border border-line/70 bg-card p-4">
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-faint">
            Timeline
          </h2>
          <Timeline entries={trip.timeline} />
        </div>

        {/* Payment (partner rate only, no customer numbers) */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-line/70 bg-card">
          <div className="border-b border-line/70 bg-surface-alt/40 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-faint">
              Your payment
            </p>
            <p className="tnum mt-1 text-[22px] font-bold leading-none text-content">
              {formatCurrency(payment.totalPayable)}
            </p>
          </div>
          <PayRow label="Trip rate" value={formatCurrency(payment.tripRate)} />
          <PayRow
            label={`TDS (${payment.tdsPercent}%)`}
            value={formatSignedCurrency(-payment.tdsAmount)}
            tone="danger"
          />
          {payment.advancePaid > 0 && (
            <PayRow
              label="Advance paid"
              value={formatSignedCurrency(-payment.advancePaid)}
              tone="muted"
            />
          )}
          <div className="flex items-center justify-between bg-surface-alt/40 px-4 py-3.5">
            <span className="text-[12px] font-bold text-content">Balance due</span>
            <span
              className={cn(
                'tnum rounded-full px-3 py-1 text-[12px] font-bold text-white',
                payment.balanceDue > 0 ? 'bg-brand' : 'bg-success',
              )}
            >
              {payment.balanceDue > 0 ? formatCurrency(payment.balanceDue) : 'Settled'}
            </span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
