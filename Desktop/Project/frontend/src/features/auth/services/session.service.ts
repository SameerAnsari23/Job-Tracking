import { ensureFreshAccessToken } from '@/api/client';
import { storageService } from '@/services/storageService';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * Startup session restoration, invoked once by SessionGate before any
 * route/guard evaluates. Reuses the exact same refresh mutex as the Axios
 * response interceptor (ensureFreshAccessToken) — there is only ever one
 * /auth/refresh call in flight product-wide, never a duplicate path here.
 */
export async function restoreSession(): Promise<void> {
  const { setUser, clearAuth, setRestoring } = useAuthStore.getState();

  if (!storageService.getRefreshToken()) {
    setRestoring(false);
    return;
  }

  const accessToken = await ensureFreshAccessToken();

  if (!accessToken) {
    storageService.clearRefreshToken();
    clearAuth();
    setRestoring(false);
    return;
  }

  try {
    const me = await authApi.getCurrentUser();
    setUser({ userId: me.userId, email: null });
  } catch {
    // The refresh itself succeeded (the session IS valid) — a failing
    // /auth/me here is a separate, non-fatal problem. Profile info simply
    // stays unavailable until the next successful fetch.
  } finally {
    setRestoring(false);
  }
}
