import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Server-state read of GET /auth/me, kept separate from the Zustand store
 * (which only carries the minimal identity fields needed synchronously by
 * guards/UI). Available for future features that need the live value
 * rather than the session-restoration snapshot.
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
