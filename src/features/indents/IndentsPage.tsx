import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiFileText, FiMapPin, FiPackage } from 'react-icons/fi';
import { PageLayout } from '@/components/layout/PageLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { queryKeys } from '@/api/queryClient';
import {
  countActiveFilters,
  DEFAULT_INDENT_FILTERS,
  indentService,
} from '@/services/indent.service';
import { useUiStore } from '@/store/ui.store';
import { cn } from '@/utils/cn';
import { IndentCard } from './IndentCard';
import { IndentFilterSheet, type IndentFilterFacet } from './IndentFilterSheet';

interface FilterChipProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ icon, label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pressable flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-xl border bg-card px-3 py-2.5 text-[12px] font-semibold transition-colors',
        active ? 'border-brand text-brand' : 'border-line text-content hover:border-brand/60',
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className={active ? 'text-brand' : 'text-muted'}>{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <FiChevronDown size={14} className={active ? 'text-brand' : 'text-muted'} />
    </button>
  );
}

export function IndentsPage() {
  const navigate = useNavigate();
  const filters = useUiStore((state) => state.indentFilters);
  const setFilters = useUiStore((state) => state.setIndentFilters);
  const resetFilters = useUiStore((state) => state.resetIndentFilters);
  const [sheetFacet, setSheetFacet] = useState<IndentFilterFacet | null>(null);
  const openSheet = (f: IndentFilterFacet) => setSheetFacet(f);
  const closeSheet = () => setSheetFacet(null);

  const allQuery = useQuery({
    queryKey: queryKeys.indents.list(DEFAULT_INDENT_FILTERS),
    queryFn: () => indentService.list(DEFAULT_INDENT_FILTERS),
  });

  const query = useQuery({
    queryKey: queryKeys.indents.list(filters),
    queryFn: () => indentService.list(filters),
    placeholderData: (previous) => previous,
  });

  const activeCount = countActiveFilters(filters);
  const total = query.data?.length ?? 0;

  const routeLabel =
    filters.route.length === 0
      ? 'City / Route'
      : filters.route.length === 1
        ? filters.route[0]
        : `${filters.route.length} branches`;
  const typeLabel = filters.type === 'all' ? 'Load type' : filters.type;

  return (
    <>
      <PageLayout padded={false}>
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-20 border-b border-line/70 bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-2 px-4 py-3">
            <FilterChip
              icon={<FiMapPin size={13} />}
              label={routeLabel}
              active={filters.route.length > 0}
              onClick={() => openSheet('route')}
            />
            <FilterChip
              icon={<FiPackage size={13} />}
              label={typeLabel}
              active={filters.type !== 'all'}
              onClick={() => openSheet('type')}
            />
          </div>
        </div>

        {/* List header */}
        <div className="mx-auto flex w-full max-w-4xl items-baseline justify-between px-4 pt-4">
          <h1 className="text-[15px] font-bold text-content">Available loads</h1>
          <span className="text-[12px] font-semibold text-muted">
            {query.isSuccess ? `${total} open` : ''}
          </span>
        </div>

        <div className="mx-auto w-full max-w-4xl px-4 pt-3 pb-6">
          {query.isPending && <ListSkeleton count={3} />}

          {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}

          {query.isSuccess &&
            (query.data.length === 0 ? (
              <EmptyState
                icon={<FiFileText />}
                title={activeCount > 0 ? 'No matching loads' : 'No open loads right now'}
                description={
                  activeCount > 0
                    ? 'Nothing matches these filters. Clear them to see everything on offer.'
                    : 'New loads appear here as soon as they are posted for your routes.'
                }
                actionLabel={activeCount > 0 ? 'Clear filters' : undefined}
                onAction={activeCount > 0 ? resetFilters : undefined}
              />
            ) : (
              // Responsive grid: 1 col on mobile, 2 cols from md upwards.
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {query.data.map((indent, index) => (
                  <IndentCard
                    key={indent.id}
                    indent={indent}
                    index={index}
                    onOpen={() => navigate(`/indents/${indent.id}`)}
                  />
                ))}
              </ul>
            ))}
        </div>
      </PageLayout>

      <IndentFilterSheet
        open={sheetFacet !== null}
        facet={sheetFacet ?? 'route'}
        onClose={closeSheet}
        filters={filters}
        onApply={setFilters}
        indents={allQuery.data ?? []}
      />
    </>
  );
}
