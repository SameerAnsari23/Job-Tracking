/**
 * The ONLY module that touches localStorage directly (lint-enforced,
 * Phase 16.5 §4.7) — apart from the zustand persist middleware in
 * shared/stores, which manages its own keys.
 *
 * The refresh token is the single persisted credential. The access token
 * lives in memory only (authStore) and is never written here.
 */
const REFRESH_TOKEN_KEY = 'jobnotify.refreshToken';

export const storageService = {
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null; // storage unavailable (private mode restrictions etc.)
    }
  },

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      /* non-fatal — session will not survive reload */
    }
  },

  clearRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};
