/**
 * Wire-level DTOs (Phase 18.0), mirrored 1:1 from the backend's confirmed
 * contracts. Do not add fields the backend does not send — session
 * restoration deliberately tolerates the gaps (see authStore's AuthUser).
 */

export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login response `data` (LoginResultDto). */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  isVerified: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

/** POST /auth/register response `data` — no tokens; the user is not yet authenticated. */
export interface RegisterResponse {
  userId: string;
  email: string;
}

/** POST /auth/refresh response `data` (RefreshTokenResultDto). */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/** GET /auth/me response `data`. */
export interface CurrentUserResponse {
  userId: string;
}
