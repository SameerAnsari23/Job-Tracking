import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/app/env';
import { tokenService } from '@/services/tokenService';
import { storageService } from '@/services/storageService';
import type { ApiError } from '@/types/api.types';
import type { RefreshTokenResponse } from '@/features/auth/types/auth.types';

/**
 * The single Axios instance (Phase 16.5 §4.2). No other module constructs
 * its own. Axios performs NO retries — retry ownership lives in TanStack
 * Query (see app/queryClient.ts).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Request-Id'] = crypto.randomUUID();
  return config;
});

interface BackendErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/**
 * Normalizes the REAL backend envelope (errorHandler.ts):
 * `{success:false, error:{code, message, details?}}` — `details`, when
 * present, is an array of `{field, message}` pairs, never a flat Record.
 */
function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as Partial<BackendErrorEnvelope> | undefined;
    return {
      status: error.response.status,
      code: data?.error?.code ?? `HTTP_${error.response.status}`,
      message: data?.error?.message ?? 'Request failed.',
      details: data?.error?.details ?? null,
    };
  }
  // Timeouts and connection failures normalize to NETWORK so downstream
  // handling switches on code, never on Axios internals.
  return {
    status: 0,
    code: 'NETWORK',
    message: 'Connection failed. Check your internet connection.',
    details: null,
  };
}

// Endpoints excluded from the 401 refresh flow: a 401 from any of these IS
// the terminal failure (retrying would recurse into the same flow, and for
// /auth/refresh specifically, the backend's refresh tokens are single-use —
// retrying it here would attempt to reuse an already-claimed token).
const REFRESH_EXEMPT_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function isRefreshExempt(url?: string): boolean {
  return Boolean(url && REFRESH_EXEMPT_PATHS.some((path) => url.includes(path)));
}

interface RefreshEnvelope {
  success: true;
  data: RefreshTokenResponse;
}

// Single-flight mutex: concurrent 401s across the app must share ONE
// in-flight refresh call. The backend claims each refresh token atomically
// (Redis SET NX) — a second concurrent call with the same token is rejected
// as TOKEN_REVOKED, so sending it twice is not merely wasteful, it is wrong.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = storageService.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await apiClient.post<RefreshEnvelope>('/auth/refresh', { refreshToken });
    storageService.setRefreshToken(data.data.refreshToken);
    tokenService.setAccessToken(data.data.accessToken);
    return data.data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Ensures at most one /auth/refresh call is ever in flight product-wide.
 * Exported so session restoration (features/auth) can share the exact same
 * mutex instead of duplicating refresh logic.
 */
export function ensureFreshAccessToken(): Promise<string | null> {
  refreshPromise ??= performRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !isRefreshExempt(config.url)
    ) {
      config._retry = true;

      const newAccessToken = await ensureFreshAccessToken();

      if (newAccessToken) {
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      }

      // Refresh failed — the session is over. Clearing auth here (rather
      // than navigating) is deliberate: ProtectedRoute reacts to
      // isAuthenticated and redirects to /login on its own re-render.
      storageService.clearRefreshToken();
      tokenService.clearSession();
    }

    return Promise.reject(toApiError(error));
  },
);
