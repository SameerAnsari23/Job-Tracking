import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { performLogout } from './logout.service';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('performLogout', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession('token-1', { userId: 'u1', email: 'a@b.com' });
    storageService.setRefreshToken('refresh-1');
  });

  it('revokes the refresh token server-side and clears local session', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(url('/auth/logout'), async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await performLogout();

    expect(receivedBody).toEqual({ refreshToken: 'refresh-1' });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(storageService.getRefreshToken()).toBeNull();
  });

  it('still clears local session when the network call fails (offline logout)', async () => {
    server.use(http.post(url('/auth/logout'), () => HttpResponse.error()));

    await performLogout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(storageService.getRefreshToken()).toBeNull();
  });

  it('skips the network call when there is no persisted refresh token', async () => {
    storageService.clearRefreshToken();
    let called = false;
    server.use(
      http.post(url('/auth/logout'), () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await performLogout();

    expect(called).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
