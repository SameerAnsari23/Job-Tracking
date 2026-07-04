import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { SessionGate } from '@/app/SessionGate';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('SessionGate', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isRestoring: true });
    storageService.clearRefreshToken();
  });

  it('settles immediately and renders children when there is no persisted session', async () => {
    render(
      <SessionGate>
        <div>App content</div>
      </SessionGate>,
    );

    await waitFor(() => expect(screen.getByText('App content')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('shows the splash while a real restoration is in flight, then renders children once settled', async () => {
    storageService.setRefreshToken('refresh-1');
    server.use(
      http.post(url('/auth/refresh'), async () => {
        // Deliberate latency: without it, the splash could theoretically
        // never render before the promise settles in this test environment.
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({
          success: true,
          data: { accessToken: 'access-1', refreshToken: 'refresh-2', expiresAt: new Date().toISOString() },
        });
      }),
      http.get(url('/auth/me'), () => HttpResponse.json({ success: true, data: { userId: 'user-1' } })),
    );

    render(
      <SessionGate>
        <div>App content</div>
      </SessionGate>,
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('App content')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('access-1');
  });

  it('never leaves an expired session authenticated', async () => {
    storageService.setRefreshToken('stale-refresh');
    server.use(
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'TOKEN_REVOKED', message: 'Refresh token has already been used.' } },
          { status: 401 },
        ),
      ),
    );

    render(
      <SessionGate>
        <div>App content</div>
      </SessionGate>,
    );

    await waitFor(() => expect(screen.getByText('App content')).toBeInTheDocument());
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(storageService.getRefreshToken()).toBeNull();
  });
});
