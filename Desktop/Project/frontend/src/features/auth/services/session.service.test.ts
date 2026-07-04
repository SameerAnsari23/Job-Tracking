import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { restoreSession } from './session.service';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('restoreSession', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isRestoring: true });
    storageService.clearRefreshToken();
  });

  it('settles immediately with no persisted refresh token', async () => {
    await restoreSession();

    const state = useAuthStore.getState();
    expect(state.isRestoring).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('restores the session via refresh + /auth/me when a refresh token is persisted', async () => {
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

    await restoreSession();

    const state = useAuthStore.getState();
    expect(state.isRestoring).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-1');
    expect(state.user).toEqual({ userId: 'user-1', email: null });
    expect(storageService.getRefreshToken()).toBe('refresh-2');
  });

  it('clears everything when the persisted refresh token is rejected', async () => {
    storageService.setRefreshToken('stale-refresh');
    server.use(
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid refresh token.' } },
          { status: 401 },
        ),
      ),
    );

    await restoreSession();

    const state = useAuthStore.getState();
    expect(state.isRestoring).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(storageService.getRefreshToken()).toBeNull();
  });

  it('keeps the session valid even if /auth/me fails after a successful refresh', async () => {
    storageService.setRefreshToken('refresh-1');
    server.use(
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json({
          success: true,
          data: { accessToken: 'access-1', refreshToken: 'refresh-2', expiresAt: new Date().toISOString() },
        }),
      ),
      http.get(url('/auth/me'), () => HttpResponse.error()),
    );

    await restoreSession();

    const state = useAuthStore.getState();
    expect(state.isRestoring).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('access-1');
    expect(state.user).toBeNull();
  });
});
