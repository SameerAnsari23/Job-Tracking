import { storageService } from '@/services/storageService';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Full logout cleanup. The server-side revoke is best-effort: the
 * client-side session ends regardless of whether the network call
 * succeeds (offline logout must still work).
 */
export async function performLogout(): Promise<void> {
  const refreshToken = storageService.getRefreshToken();

  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Non-fatal — proceed to clear client-side state regardless.
    }
  }

  storageService.clearRefreshToken();
  useAuthStore.getState().clearAuth();
}
