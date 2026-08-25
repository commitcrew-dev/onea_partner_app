import { apiClient } from '@/api/client';
import { db, delay, fail, USE_MOCKS } from '@/services/mock/db';
import type { ApiEnvelope, Indent, IndentFilters } from '@/types';

/** Applies the filter sheet's dimensions locally (used by mocks and the sheet count). */
export function applyIndentFilters(indents: Indent[], filters: IndentFilters): Indent[] {
  return indents.filter((indent) => {
    if (filters.status !== 'all' && indent.status !== filters.status) return false;
    if (filters.date !== 'all' && indent.loadingDate !== filters.date) return false;
    if (filters.type !== 'all' && indent.loadType !== filters.type) return false;
    if (
      filters.route.length > 0 &&
      !filters.route.includes(indent.origin) &&
      !filters.route.includes(indent.destination)
    ) {
      return false;
    }
    return true;
  });
}

export const DEFAULT_INDENT_FILTERS: IndentFilters = {
  status: 'all',
  date: 'all',
  route: [],
  type: 'all',
};

/** Number of narrowed dimensions — shown as the chip-bar badge. */
export function countActiveFilters(filters: IndentFilters): number {
  let n = 0;
  if (filters.status !== 'all') n += 1;
  if (filters.date !== 'all') n += 1;
  if (filters.type !== 'all') n += 1;
  if (filters.route.length > 0) n += 1;
  return n;
}

export const indentService = {
  async list(filters: IndentFilters = DEFAULT_INDENT_FILTERS): Promise<Indent[]> {
    if (USE_MOCKS) {
      const sorted = [...db.indents].sort(
        (a, b) => Number(b.reference) - Number(a.reference),
      );
      return delay(applyIndentFilters(sorted, filters));
    }

    // Backend accepts a comma-separated list of branch names.
    const params: Record<string, string> = {};
    if (filters.route.length > 0) params.branches = filters.route.join(',');

    const { data } = await apiClient.get<ApiEnvelope<{ items: Indent[] }>>('/indents', { params });
    return data.data.items;
  },

  async detail(indentId: string): Promise<Indent> {
    if (USE_MOCKS) {
      const found = db.indents.find((indent) => indent.id === indentId);
      if (!found) return fail(404, 'INDENT_NOT_FOUND', 'This indent is no longer available.');
      return delay(found);
    }

    const { data } = await apiClient.get<ApiEnvelope<Indent>>(`/indents/${indentId}`);
    return data.data;
  },

  /**
   * Expresses interest in an indent. The ops team confirms the assignment, so
   * the indent moves to `assigned` rather than creating a trip directly.
   */
  async accept(indentId: string): Promise<Indent> {
    if (USE_MOCKS) {
      const found = db.indents.find((indent) => indent.id === indentId);
      if (!found) return fail(404, 'INDENT_NOT_FOUND', 'This indent is no longer available.');
      if (found.status !== 'open') {
        return fail(409, 'INDENT_TAKEN', 'This indent has already been assigned.');
      }
      found.status = 'assigned';
      return delay(found);
    }

    const { data } = await apiClient.post<ApiEnvelope<Indent>>(`/indents/${indentId}/accept`);
    return data.data;
  },
};
