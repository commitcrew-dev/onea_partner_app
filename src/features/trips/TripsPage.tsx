import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppCard } from '@/components/ui/AppCard';
import { TripStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { RoutePins } from '@/components/ui/RoutePins';
import { queryKeys } from '@/api/queryClient';
import { tripService, type TripScope } from '@/services/trip.service';
import { formatShortDate, formatWeight } from '@/utils/format';
import { cn } from '@/utils/cn';

const SCOPES: Array<{ key: TripScope; label: string }> = [
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
];

export function TripsPage() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<TripScope>('ongoing');

  const query = useQuery({
    queryKey: queryKeys.trips.list(scope),
    queryFn: () => tripService.list(scope),
  });

  return (
    <PageLayout padded={false}>
      {/* Sticky header: brand-tinted icon + title + underline tabs */}
      <div className="sticky top-0 z-20 border-b border-line/70 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-4xl px-4 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand">
              <FiActivity size={18} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold leading-tight tracking-tight text-content">
                My Trips
              </h1>
              <p className="mt-0.5 text-[11px] text-muted">
                Track ongoing loads and delivery history
              </p>
            </div>
          </div>

          <div role="tablist" aria-label="Trip status" className="mt-4 flex gap-6">
            {SCOPES.map((item) => {
              const active = scope === item.key;
              return (
                <button
                  key={item.key}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => setScope(item.key)}
                  className={cn(
                    'relative pb-2.5 text-[13px] font-semibold transition-colors',
                    active ? 'text-brand' : 'text-muted',
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="trip-tab-underline"
                      aria-hidden
                      className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-brand"
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pt-4 pb-6">
        {query.isPending && <ListSkeleton count={2} />}

        {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

        {query.isSuccess &&
          (query.data.length === 0 ? (
            <EmptyState
              icon={<FiActivity />}
              title={scope === 'ongoing' ? 'No trips underway' : 'No completed trips yet'}
              description={
                scope === 'ongoing'
                  ? 'Once you accept an indent and it is assigned, the trip appears here.'
                  : 'Delivered trips will be listed here.'
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {query.data.map((trip, index) => (
                <AppCard
                  as="li"
                  key={trip.id}
                  index={index}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div className="flex items-start justify-between gap-4 px-4 pt-3">
                    <span className="text-[11px] font-semibold text-faint">#{trip.reference}</span>
                    <TripStatusBadge status={trip.status} label={trip.statusLabel} />
                  </div>

                  <div className="flex items-start gap-4 px-4 py-3">
                    <RoutePins
                      className="flex-1"
                      compact
                      origin={trip.origin}
                      destination={trip.destination}
                    />
                    <div className="shrink-0 text-right text-[11px] text-muted">
                      <p>{formatShortDate(trip.loadingDate)}</p>
                      <p className="mt-1 tnum text-content">{trip.truckNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-line/70 bg-surface-alt/30 px-4 py-2.5">
                    <span className="text-[11px] text-faint">
                      {trip.vehicleType} · {formatWeight(trip.weightTon)}
                    </span>
                    <span className="text-[11px] font-semibold text-brand">Details →</span>
                  </div>
                </AppCard>
              ))}
            </ul>
          ))}
      </div>
    </PageLayout>
  );
}
