import { useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiMapPin, FiPackage, FiSearch, FiX } from 'react-icons/fi';
import { Sheet } from '@/components/ui/Sheet';
import { LOAD_TYPES } from '@/constants';
import { queryKeys } from '@/api/queryClient';
import { mastersService } from '@/services/masters.service';
import { applyIndentFilters, DEFAULT_INDENT_FILTERS } from '@/services/indent.service';
import { cn } from '@/utils/cn';
import type { Indent, IndentFilters, LoadType } from '@/types';

/** Which facet the sheet is focused on — chip-tap opens the matching one. */
export type IndentFilterFacet = 'route' | 'type';

interface IndentFilterSheetProps {
  open: boolean;
  facet: IndentFilterFacet;
  onClose: () => void;
  filters: IndentFilters;
  onApply: (filters: IndentFilters) => void;
  indents: Indent[];
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pressable rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors',
        active
          ? 'border-brand bg-brand text-white shadow-sm shadow-brand/30'
          : 'border-line bg-card text-content hover:border-brand/60',
      )}
    >
      {children}
    </button>
  );
}

export function IndentFilterSheet({
  open,
  facet,
  onClose,
  filters,
  onApply,
  indents,
}: IndentFilterSheetProps) {
  const [draft, setDraft] = useState<IndentFilters>(filters);
  const [search, setSearch] = useState('');

  // Reset local state each time the sheet is reopened, so it never shows a
  // stale draft or a search term the user forgot about.
  useEffect(() => {
    if (open) {
      setDraft(filters);
      setSearch('');
    }
  }, [open, filters]);

  // Debounce so we don't hit the API on every keystroke.
  const debouncedSearch = useDebouncedValue(search.trim(), 250);

  const branchesQuery = useQuery({
    queryKey: queryKeys.masters.branches(debouncedSearch),
    queryFn: () => mastersService.branches(debouncedSearch || undefined),
    // Empty-search fetch is cached for 30min; searches are shorter-lived.
    staleTime: debouncedSearch ? 60_000 : 30 * 60_000,
    enabled: facet === 'route',
    placeholderData: (previous) => previous,
  });

  const branches = branchesQuery.data ?? [];

  const resultCount = useMemo(
    () => applyIndentFilters(indents, draft).length,
    [indents, draft],
  );

  const handleReset = () => {
    // Only reset the currently-open facet, so other filters are preserved.
    if (facet === 'route') setDraft((d) => ({ ...d, route: [] }));
    else setDraft((d) => ({ ...d, type: 'all' }));
    setSearch('');
  };

  const toggleBranch = (branch: string) => {
    setDraft((d) => {
      const selected = new Set(d.route);
      if (selected.has(branch)) selected.delete(branch);
      else selected.add(branch);
      return { ...d, route: Array.from(selected) };
    });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const title = facet === 'route' ? 'City / Route' : 'Load type';

  return (
    <Sheet open={open} onClose={onClose} labelledBy="filter-title" tone="light">
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <h2 id="filter-title" className="text-[15px] font-bold text-content">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="pressable -mr-1 rounded-full p-1.5 text-muted hover:bg-surface-alt"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {facet === 'route' && (
          <>
            <div className="relative mb-4">
              <FiSearch
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // Sheet is a framer-motion drag container — stop pointer events
                // here so typing doesn't get swallowed by drag detection.
                onPointerDown={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
                placeholder="Search branch…"
                autoFocus
                className="w-full rounded-xl border border-line bg-card py-2.5 pl-9 pr-3 text-[13px] text-content outline-none placeholder:text-faint focus:border-brand"
              />
            </div>

            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted">
              <FiMapPin size={12} className="text-content" />
              Branch
            </div>

            <div className="flex flex-wrap gap-2">
              <ChipButton
                active={draft.route.length === 0}
                onClick={() => setDraft((d) => ({ ...d, route: [] }))}
              >
                All branches
              </ChipButton>

              {branchesQuery.isPending && (
                <span className="text-[12px] text-faint">Loading branches…</span>
              )}

              {branches.map((b) => (
                <ChipButton
                  key={b}
                  active={draft.route.includes(b)}
                  onClick={() => toggleBranch(b)}
                >
                  {b}
                </ChipButton>
              ))}

              {search && branches.length === 0 && !branchesQuery.isPending && (
                <p className="text-[12px] text-faint">
                  No branches match &ldquo;{search}&rdquo;
                </p>
              )}
            </div>

            {draft.route.length > 0 && (
              <p className="mt-3 text-[11px] text-muted">
                <span className="font-semibold text-content">{draft.route.length}</span> selected
                {draft.route.length > 3 ? '' : ` · ${draft.route.join(', ')}`}
              </p>
            )}
          </>
        )}

        {facet === 'type' && (
          <>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted">
              <FiPackage size={12} className="text-content" />
              Load type
            </div>

            <div className="flex flex-wrap gap-2">
              <ChipButton
                active={draft.type === 'all'}
                onClick={() => setDraft((d) => ({ ...d, type: 'all' }))}
              >
                All types
              </ChipButton>
              {LOAD_TYPES.map((t: LoadType) => (
                <ChipButton
                  key={t}
                  active={draft.type === t}
                  onClick={() => setDraft((d) => ({ ...d, type: t }))}
                >
                  {t}
                </ChipButton>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-line/70 bg-surface p-4 pb-safe">
        <button
          type="button"
          onClick={handleReset}
          className="pressable rounded-xl border border-line/80 bg-card py-3 text-[13px] font-bold text-content"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="pressable rounded-xl bg-navy py-3 text-[13px] font-bold text-white shadow-sm shadow-navy/20"
        >
          Show {resultCount} load{resultCount === 1 ? '' : 's'}
        </button>
      </div>
    </Sheet>
  );
}

// Keep the DEFAULT_INDENT_FILTERS export path unchanged for existing callers.
export { DEFAULT_INDENT_FILTERS };
