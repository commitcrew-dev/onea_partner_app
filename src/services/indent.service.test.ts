import { describe, expect, it } from 'vitest';
import {
  applyIndentFilters,
  countActiveFilters,
  DEFAULT_INDENT_FILTERS,
  indentService,
} from './indent.service';
import { db } from './mock/db';
import type { IndentFilters } from '@/types';

const filters = (patch: Partial<IndentFilters>): IndentFilters => ({
  ...DEFAULT_INDENT_FILTERS,
  ...patch,
});

describe('applyIndentFilters', () => {
  it('returns everything when nothing is narrowed', () => {
    expect(applyIndentFilters(db.indents, DEFAULT_INDENT_FILTERS)).toHaveLength(5);
  });

  it('filters by status', () => {
    const open = applyIndentFilters(db.indents, filters({ status: 'open' }));
    expect(open).toHaveLength(4);
    expect(open.every((indent) => indent.status === 'open')).toBe(true);
  });

  it('matches a route against origin or destination', () => {
    const chennai = applyIndentFilters(db.indents, filters({ route: ['Chennai'] }));
    // #1201 departs Chennai and #1187 arrives there.
    expect(chennai.map((indent) => indent.reference).sort()).toEqual(['1187', '1201']);
  });

  it('filters by load type', () => {
    const textiles = applyIndentFilters(db.indents, filters({ type: 'Textiles' }));
    expect(textiles).toHaveLength(1);
    expect(textiles[0].reference).toBe('1198');
  });

  it('combines facets conjunctively', () => {
    const result = applyIndentFilters(
      db.indents,
      filters({ status: 'open', route: ['Coimbatore'], type: 'Textiles' }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].reference).toBe('1198');
  });

  it('returns nothing when facets conflict', () => {
    expect(
      applyIndentFilters(db.indents, filters({ route: ['Kochi'], type: 'FMCG' })),
    ).toHaveLength(0);
  });
});

describe('countActiveFilters', () => {
  it('counts only the facets narrowed away from "all"', () => {
    expect(countActiveFilters(DEFAULT_INDENT_FILTERS)).toBe(0);
    expect(countActiveFilters(filters({ route: ['Salem'] }))).toBe(1);
    expect(countActiveFilters(filters({ route: ['Salem'], status: 'open' }))).toBe(2);
  });
});

describe('indentService.accept', () => {
  it('moves an open indent to assigned', async () => {
    const updated = await indentService.accept('ind_1201');
    expect(updated.status).toBe('assigned');
  });

  it('rejects an indent that is already assigned', async () => {
    await expect(indentService.accept('ind_1180')).rejects.toMatchObject({
      status: 409,
      code: 'INDENT_TAKEN',
    });
  });

  it('rejects an unknown indent', async () => {
    await expect(indentService.accept('ind_missing')).rejects.toMatchObject({ status: 404 });
  });
});
