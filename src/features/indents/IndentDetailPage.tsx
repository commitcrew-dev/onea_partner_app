import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiPackage, FiPhone, FiThumbsUp, FiTruck } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { RoutePins } from '@/components/ui/RoutePins';
import { IndentStatusBadge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { RowSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { queryKeys } from '@/api/queryClient';
import { indentService } from '@/services/indent.service';
import { useHaptics } from '@/hooks/useHaptics';
import { useUiStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';
import { formatCurrency, formatLongDate, formatShortDate, formatWeight } from '@/utils/format';
import type { ApiFailure } from '@/types';

/** Icon + label + value column used inside the load spec grid. */
function SpecTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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

export function IndentDetailPage() {
  const { indentId = '' } = useParams();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const { success, error: errorHaptic } = useHaptics();

  const [confirming, setConfirming] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.indents.detail(indentId),
    queryFn: () => indentService.detail(indentId),
    enabled: Boolean(indentId),
  });

  const accept = useMutation({
    mutationFn: () => indentService.accept(indentId),
    onSuccess: () => {
      success();
      pushToast('Interest sent. Our team will confirm shortly.', 'success');
      void queryClient.invalidateQueries({ queryKey: queryKeys.indents.all });
      setConfirming(false);
    },
    onError: (error: ApiFailure) => {
      errorHaptic();
      pushToast(error.message ?? 'Could not send your interest.', 'error');
      setConfirming(false);
    },
  });

  if (query.isPending) {
    return (
      <PageLayout title="Load" showBack>
        <Skeleton className="mb-4 h-9 w-64" />
        <RowSkeleton count={5} />
      </PageLayout>
    );
  }

  if (query.isError) {
    return (
      <PageLayout title="Load" showBack>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      </PageLayout>
    );
  }

  const indent = query.data;
  const isOpen = indent.status === 'open';

  return (
    <>
      <PageLayout
        title={`#${indent.reference}`}
        showBack
        padded={false}
        footer={
          <div className="flex gap-3">
            {indent.contactMobile && (
              <motion.a
                href={`tel:${indent.contactMobile}`}
                whileTap={{ scale: 0.98 }}
                className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success transition-colors hover:bg-success/25"
                aria-label="Call ops"
              >
                <FiPhone size={18} />
              </motion.a>
            )}
            <motion.button
              type="button"
              disabled={!isOpen || accept.isPending}
              onClick={() => setConfirming(true)}
              whileTap={{ scale: isOpen ? 0.98 : 1 }}
              className={cn(
                'flex h-[54px] flex-1 items-center justify-center gap-2 rounded-2xl text-[14px] font-bold transition-all',
                isOpen
                  ? 'bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-600'
                  : 'bg-surface-alt text-faint',
              )}
            >
              <FiThumbsUp size={16} />
              {isOpen ? "I'm interested" : 'Already assigned'}
            </motion.button>
          </div>
        }
      >
        <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-6">
          {/* Route card */}
          <div className="card-base p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-muted">
                <FiTruck size={14} className="text-content" />
                {indent.vehicleType}
                <span className="text-line">|</span>
                <FiClock size={11} />
                {formatShortDate(indent.loadingDate)}
              </div>
              <IndentStatusBadge status={indent.status} />
            </div>

            <RoutePins origin={indent.origin} destination={indent.destination} />
          </div>

          {/* Spec grid */}
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <SpecTile
              icon={<FiPackage size={16} />}
              label="Weight"
              value={formatWeight(indent.weightTon)}
            />
            <SpecTile
              icon={<FiPackage size={16} />}
              label="Load type"
              value={indent.loadType}
            />
            <SpecTile
              icon={<FiCalendar size={16} />}
              label="Loading date"
              value={formatLongDate(indent.loadingDate)}
            />
            <SpecTile
              icon={<FiTruck size={16} />}
              label="Vehicle"
              value={indent.vehicleType}
            />
          </div>

          {/* Rate — partner_price only, no customer pricing */}
          <div className="mt-3 overflow-hidden rounded-hero bg-brand-hero p-5 text-white shadow-lg shadow-brand/25">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              Your rate
            </p>
            <p className="tnum mt-1 text-[28px] font-bold leading-none">
              {formatCurrency(indent.amount)}
            </p>
            <p className="mt-2 text-[11px] text-white/85">
              Final assignment will be confirmed by our team
            </p>
          </div>

          {indent.notes && (
            <div className="mt-3 rounded-2xl border border-line/70 bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-faint">Notes</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{indent.notes}</p>
            </div>
          )}
        </div>
      </PageLayout>

      <ConfirmDialog
        open={confirming}
        title="Mark interest in this load?"
        message={`${indent.origin} → ${indent.destination} · ${formatWeight(indent.weightTon)} ${indent.loadType}. Our team will confirm and allocate a truck if a match is found.`}
        confirmLabel="Yes, I'm interested"
        loading={accept.isPending}
        onConfirm={() => accept.mutate()}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
