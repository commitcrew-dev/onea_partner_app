import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiPhone, FiPlus, FiTruck, FiUser } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppCard } from '@/components/ui/AppCard';
import { TruckStatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { queryKeys } from '@/api/queryClient';
import { truckService } from '@/services/truck.service';
import { ROUTES } from '@/constants';
import { formatWeight } from '@/utils/format';

export function TrucksPage() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: queryKeys.trucks.list(),
    queryFn: () => truckService.list(),
  });

  const total = query.data?.length ?? 0;
  const available =
    query.data?.filter((truck) => truck.status === 'waiting-for-load').length ?? 0;

  return (
    <PageLayout padded={false}>
      {/* Sticky page header — brand-tinted icon + title + primary CTA */}
      <div className="sticky top-0 z-20 border-b border-line/70 bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
              <FiTruck size={18} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold leading-tight tracking-tight text-content">
                My Trucks
              </h1>
              {query.isSuccess ? (
                <p className="mt-0.5 text-[11px] text-muted">
                  <span className="tnum font-semibold text-content">{total}</span> total ·{' '}
                  <span className="tnum font-semibold text-success">{available}</span> free
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-muted">Your fleet at a glance</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.addTruck)}
            className="pressable flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2.5 text-[12px] font-bold text-white shadow-sm shadow-brand/25"
          >
            <FiPlus size={14} />
            Add truck
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pt-4 pb-6">
        {query.isPending && <ListSkeleton count={3} />}

        {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

        {query.isSuccess &&
          (query.data.length === 0 ? (
            <EmptyState
              icon={<FiTruck />}
              title="No trucks added yet"
              description="Add your vehicles so our team can match them to loads on your routes."
              actionLabel="Add a truck"
              onAction={() => navigate(ROUTES.addTruck)}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {query.data.map((truck, index) => (
                <AppCard
                  as="li"
                  key={truck.id}
                  index={index}
                  onClick={() => navigate(`/trucks/${truck.id}`)}
                >
                  <div className="flex items-start gap-3 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand">
                      <FiTruck size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="tnum text-[14px] font-bold leading-tight tracking-tight text-content">
                          {truck.registrationNumber}
                        </h3>
                        <TruckStatusBadge status={truck.status} />
                      </div>
                      <p className="mt-1 text-[12px] font-medium text-muted">
                        {truck.vehicleType} · {formatWeight(truck.capacityTon)} · {truck.city}
                      </p>
                      {truck.driverName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-faint">
                          <FiUser size={11} aria-hidden className="shrink-0" />
                          {truck.driverName}
                        </p>
                      )}
                    </div>

                    {truck.driverMobile && (
                      <a
                        href={`tel:${truck.driverMobile}`}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Call ${truck.driverName || 'driver'}`}
                        className="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line/70 bg-card text-muted transition-colors hover:border-brand hover:text-brand"
                      >
                        <FiPhone size={16} aria-hidden />
                      </a>
                    )}
                  </div>
                </AppCard>
              ))}
            </ul>
          ))}
      </div>
    </PageLayout>
  );
}
