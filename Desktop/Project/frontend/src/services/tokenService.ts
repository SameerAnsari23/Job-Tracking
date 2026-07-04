import { useAuthStore } from '@/shared/stores/authStore';

/**
 * The sanctioned boundary between the Axios client and the auth store.
 * Interceptors run outside React, so every access is imperative
 * (getState/setState), never a hook.
 */
export const tokenService = {
  getAccessToken(): string | null {
    return useAuthStore.getState().accessToken;
  },
  /** Used by the response interceptor's refresh mutex to rotate the token. */
  setAccessToken(accessToken: string): void {
    useAuthStore.getState().setAccessToken(accessToken);
  },
  /** Used when a refresh attempt fails outright — the session is over. */
  clearSession(): void {
    useAuthStore.getState().clearAuth();
  },
};
