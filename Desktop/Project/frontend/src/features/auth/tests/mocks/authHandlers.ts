import { http, HttpResponse } from 'msw';
import { env } from '@/app/env';

/**
 * Shared MSW handler factories for the auth endpoints — reused by both
 * Storybook (browser worker, msw-storybook-addon) and Vitest (node server,
 * src/test/server.ts). Keeping them here means a single source of truth
 * for what the mocked backend looks like; no duplicated fixture shapes.
 */
const url = (path: string) => `${env.apiBaseUrl}${path}`;

export const VALID_CREDENTIALS = { email: 'jane@example.com', password: 'correct-horse-1' };

export const loginSuccessHandler = http.post(url('/auth/login'), async ({ request }) => {
  const body = (await request.json()) as { email: string; password: string };
  if (body.email !== VALID_CREDENTIALS.email || body.password !== VALID_CREDENTIALS.password) {
    return HttpResponse.json(
      { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } },
      { status: 401 },
    );
  }
  return HttpResponse.json({
    success: true,
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      userId: 'user-1',
      email: body.email,
      isVerified: true,
    },
  });
});

export const loginInvalidCredentialsHandler = http.post(url('/auth/login'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } },
    { status: 401 },
  ),
);

export const loginRateLimitedHandler = http.post(url('/auth/login'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
    { status: 429 },
  ),
);

export const loginNetworkErrorHandler = http.post(url('/auth/login'), () => HttpResponse.error());

/**
 * Accepts whatever credentials it's given — used to mock the login call
 * that useSignup() chains right after a successful register, where the
 * credentials are whatever the test/story just "signed up" with, not the
 * fixed VALID_CREDENTIALS pair.
 */
export const loginAcceptAnyHandler = http.post(url('/auth/login'), async ({ request }) => {
  const body = (await request.json()) as { email: string; password: string };
  return HttpResponse.json({
    success: true,
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      userId: 'user-2',
      email: body.email,
      isVerified: false,
    },
  });
});

export const registerSuccessHandler = http.post(url('/auth/register'), async ({ request }) => {
  const body = (await request.json()) as { email: string; password: string };
  return HttpResponse.json(
    { success: true, data: { userId: 'user-2', email: body.email } },
    { status: 201 },
  );
});

export const registerConflictHandler = http.post(url('/auth/register'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'CONFLICT', message: 'An account with this email address already exists.' } },
    { status: 409 },
  ),
);

export const refreshSuccessHandler = http.post(url('/auth/refresh'), () =>
  HttpResponse.json({
    success: true,
    data: {
      accessToken: 'mock-access-token-2',
      refreshToken: 'mock-refresh-token-2',
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    },
  }),
);

export const refreshRevokedHandler = http.post(url('/auth/refresh'), () =>
  HttpResponse.json(
    { success: false, error: { code: 'TOKEN_REVOKED', message: 'Refresh token has already been used.' } },
    { status: 401 },
  ),
);

export const meSuccessHandler = http.get(url('/auth/me'), () =>
  HttpResponse.json({ success: true, data: { userId: 'user-1' } }),
);

export const logoutSuccessHandler = http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 }));
