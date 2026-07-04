import { create } from 'zustand';

/**
 * Authenticated user's known profile fields. `email` is nullable because
 * the backend's session-restoration path (POST /auth/refresh + GET /auth/me)
 * only ever returns `userId` — email is only known right after a fresh
 * login/signup response. We do not fabricate it (admin-honesty rule, Phase
 * 17.7): it stays null until a future Profile feature hydrates it.
 */
export interface AuthUser {
  userId: string;
  email: string | null;
}

/**
 * Auth state (Phase 18.0; relocated here in Phase 18.2). Lives in
 * shared/stores, not features/auth, because it is genuinely cross-feature
 * state — the Application Shell (Phase 18.1) and the Dashboard (Phase
 * 18.2) both need to read it, and the features-must-not-import-features
 * boundary rule (eslint.config.js) forbids reaching into another feature's
 * folder for it. The access token lives HERE, in memory only — never
 * persisted (XSS-safe per Phase 16.1). The refresh token is persisted via
 * storageService. This store holds ONLY client-side auth state; the user's
 * server-fetched profile beyond these fields belongs to TanStack Query,
 * not here.
 */
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /**
   * True while the startup silent-refresh (SessionGate) is in flight.
   * Starts true: the app never renders a route/guard against unknown auth
   * state.
   */
  isRestoring: boolean;

  /** Fresh login/signup: token + full known profile. */
  setSession: (accessToken: string, user: AuthUser) => void;
  /** Refresh-only update (token rotation) — profile fields are untouched. */
  setAccessToken: (accessToken: string) => void;
  /** Session-restoration/profile hydration — token is untouched. */
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setRestoring: (isRestoring: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoring: true,

  setSession: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false }),
  setRestoring: (isRestoring) => set({ isRestoring }),
}));
