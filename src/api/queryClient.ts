import { QueryClient } from '@tanstack/react-query';
import type { ApiFailure } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      // Cached data keeps the UI populated while offline; see OfflineBanner.
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        const status = (error as unknown as ApiFailure)?.status;
        // Never retry a request the server rejected on its merits.
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0,
    },
  },
});

/** Centralised query keys so invalidation stays consistent across features. */
export const queryKeys = {
  indents: {
    all: ['indents'] as const,
    list: (filters?: unknown) => ['indents', 'list', filters ?? null] as const,
    detail: (id: string) => ['indents', 'detail', id] as const,
  },
  trips: {
    all: ['trips'] as const,
    list: (scope: string) => ['trips', 'list', scope] as const,
    detail: (id: string) => ['trips', 'detail', id] as const,
  },
  trucks: {
    all: ['trucks'] as const,
    list: () => ['trucks', 'list'] as const,
    detail: (id: string) => ['trucks', 'detail', id] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
  },
  masters: {
    all: ['masters'] as const,
    branches: (search?: string) => ['masters', 'branches', search ?? ''] as const,
  },
} as const;
