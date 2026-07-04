import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { loginSuccessHandler, VALID_CREDENTIALS } from '@/features/auth/tests/mocks/authHandlers';
import { router } from '@/routes';
import { App } from './App';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

/**
 * End-to-end shell wiring (Phase 18.1): SessionGate → GuestRoute/
 * ProtectedRoute → the lazy-loaded AppLayout chunk → the routed page. These
 * exercise the REAL router (@/routes), not a test harness stand-in, so a
 * regression in any layer between login and the shell shows up here.
 *
 * `createBrowserRouter` captures `window.location` once, at module
 * evaluation time — a raw `window.history.pushState` afterwards doesn't
 * retarget the already-constructed router (nothing tells it to re-match).
 * `router.navigate()` is the router's own API for moving it to a new
 * location before/independent of whether a <RouterProvider> is mounted.
 */
async function renderAppAt(path: string) {
  await router.navigate(path);
  return render(<App />);
}

describe('application shell — routing integration', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isRestoring: true });
    storageService.clearRefreshToken();
  });

  it('redirects a deep link to /login, then returns there after signing in (deep-link + redirect-back flow)', async () => {
    server.use(loginSuccessHandler);
    const user = userEvent.setup();

    await renderAppAt('/jobs/saved');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // Back on the originally requested route, inside the real (lazy-loaded)
    // application shell — not just the placeholder page in isolation.
    expect(
      await screen.findByRole('heading', { name: 'Saved Jobs' }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  }, 15000);

  it('restores an authenticated session on refresh and lands directly in the shell', async () => {
    storageService.setRefreshToken('refresh-1');
    server.use(
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json({
          success: true,
          data: { accessToken: 'access-1', refreshToken: 'refresh-2', expiresAt: new Date().toISOString() },
        }),
      ),
      http.get(url('/auth/me'), () => HttpResponse.json({ success: true, data: { userId: 'user-1' } })),
    );

    await renderAppAt('/dashboard');

    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  }, 15000);

  it('redirects to /login when the persisted refresh token is rejected (refresh failure redirect)', async () => {
    storageService.setRefreshToken('stale-refresh');
    server.use(
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'TOKEN_REVOKED', message: 'Refresh token has already been used.' } },
          { status: 401 },
        ),
      ),
    );

    await renderAppAt('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('redirects to /login when startup restoration fails offline, instead of hanging (offline startup behavior)', async () => {
    storageService.setRefreshToken('refresh-1');
    server.use(http.post(url('/auth/refresh'), () => HttpResponse.error()));

    await renderAppAt('/dashboard');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});
