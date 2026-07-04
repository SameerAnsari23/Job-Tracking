import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/types/api.types';

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error && 'code' in error;
}

/**
 * Global query defaults (Phase 16.5 §4.3).
 *
 * Retry ownership lives HERE, never in Axios:
 *  - queries: up to 2 retries, only for network errors / 5xx / 429
 *  - mutations: never auto-retried (user mutations are not idempotent)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchOnWindowFocus: false,
      networkMode: 'online',
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        if (isApiError(error)) {
          if (error.code === 'NETWORK') return true;
          if (error.status === 429) return true;
          if (error.status >= 500) return true;
          return false; // other 4xx — user/state errors, retrying cannot help
        }
        return true;
      },
      retryDelay: (attemptIndex) => (attemptIndex === 0 ? 1_000 : 3_000),
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});
