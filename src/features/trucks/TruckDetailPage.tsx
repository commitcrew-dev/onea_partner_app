import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronRight,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { TruckStatusBadge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { RowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { RoutePins } from '@/components/ui/RoutePins';
import { AppCard } from '@/components/ui/AppCard';
import { queryKeys } from '@/api/queryClient';
import { truckService } from '@/services/truck.service';
import { tripService } from '@/services/trip.service';
import { formatMobile, formatShortDate, formatWeight } from '@/utils/format';
import type { DocumentStatus } from '@/types';
import type { ReactNode } from 'react';

/** Icon + label + value row — the primary layout unit on this screen. */
function InfoRow({
  icon,
  label,
  value,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-b-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-faint">{label}</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-content">{value}</p>
      </div>
      {trailing}
    </div>
  );
}

export function TruckDetailPage() {
  const { truckId = '' } = useParams();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: queryKeys.trucks.detail(truckId),
    queryFn: () => truckService.detail(truckId),
    enabled: Boolean(truckId),
  });

  const tripsQuery = useQuery({
    queryKey: queryKeys.trips.list('all'),
    queryFn: async () => {
      const [ongoing, completed] = await Promise.all([
        tripService.list('ongoing'),
        tripService.list('completed'),
      ]);
      return [...ongoing, ...completed];
    },
  });

  if (query.isPending) {
    return (
      <PageLayout title="Truck" showBack>
        <Skeleton className="mb-4 h-9 w-56" />
        <RowSkeleton count={5} />
      </PageLayout>
    );
  }

  if (query.isError) {
    return (
      <PageLayout title="Truck" showBack>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </PageLayout>
    );
  }

  const truck = query.data;
  const history = (tripsQuery.data ?? []).filter(
    (trip) => trip.truckNumber === truck.registrationNumber,
  );

  const rc = truck.documents.find((d) => d.id === 'rc');
  const insurance = truck.documents.find((d) => d.id === 'ins');

  return (
    <PageLayout
      title={truck.registrationNumber}
      showBack
      padded={false}
      footer={
        truck.driverMobile ? (
          <motion.a
            href={`tel:${truck.driverMobile}`}
            whileTap={{ scale: 0.98 }}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[14px] font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-600"
          >
            <FiPhone size={16} />
            Call {truck.driverName?.split(' ')[0] || 'driver'}
          </motion.a>
        ) : null
      }
    >
      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-6">
        {/* Hero: reg + vehicle type + status */}
        <div className="card-base p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-hero-soft text-brand">
              <FiTruck size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="tnum text-[18px] font-bold leading-tight tracking-tight text-content">
                {truck.registrationNumber}
              </h1>
              <p className="mt-1 text-[12px] font-medium text-muted">
                {truck.vehicleType} · {formatWeight(truck.capacityTon)}
              </p>
            </div>
            <TruckStatusBadge status={truck.status} />
          </div>
        </div>

        {/* Details */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-line/70 bg-card">
          <InfoRow icon={<FiMapPin size={16} />} label="Base city" value={truck.city} />
          {truck.driverName && (
            <InfoRow icon={<FiUser size={16} />} label="Driver" value={truck.driverName} />
          )}
          {truck.driverMobile && (
            <InfoRow
              icon={<FiPhone size={16} />}
              label="Mobile"
              value={formatMobile(truck.driverMobile)}
            />
          )}
          {rc && (
            <InfoRow
              icon={<FiFileText size={16} />}
              label="RC status"
              value={rc.label}
              trailing={<StatusPill status={rc.status} />}
            />
          )}
          {insurance && (
            <InfoRow
              icon={<FiShield size={16} />}
              label="Insurance"
              value={insurance.label}
              trailing={<StatusPill status={insurance.status} />}
            />
          )}
        </div>

        {/* Trip history */}
        <section className="mt-5">
          <div className="mb-2.5 flex items-baseline justify-between px-1">
            <h2 className="text-[13px] font-bold text-content">Trip history</h2>
            <span className="text-[11px] text-faint">{history.length} trips</span>
          </div>

          {history.length === 0 ? (
            <p className="rounded-2xl border border-line/70 bg-card p-4 text-center text-[12px] text-muted">
              This truck has not run a trip yet.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {history.slice(0, 5).map((trip, index) => (
                <AppCard
                  as="li"
                  key={trip.id}
                  index={index}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="flex items-center gap-3 p-4"
                >
                  <RoutePins
                    className="flex-1"
                    compact
                    origin={trip.origin}
                    destination={trip.destination}
                  />
                  <div className="shrink-0 text-right text-[11px] text-muted">
                    <p>{trip.reference}</p>
                    <p className="mt-0.5">{formatShortDate(trip.orderDate)}</p>
                  </div>
                  <FiChevronRight size={16} className="shrink-0 text-faint" />
                </AppCard>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

function StatusPill({ status }: { status: DocumentStatus }) {
  const styles = {
    verified: 'bg-success/15 text-success',
    pending: 'bg-warning/15 text-warning',
    expired: 'bg-danger/15 text-danger',
    rejected: 'bg-danger/15 text-danger',
  } as const;
  const label = {
    verified: 'Verified',
    pending: 'Pending',
    expired: 'Expired',
    rejected: 'Rejected',
  }[status];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}
    >
      {label}
    </span>
  );
}
