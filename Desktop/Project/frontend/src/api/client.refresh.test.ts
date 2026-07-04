import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { apiClient } from './client';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

/**
 * The single-flight 401 refresh mutex is the highest-risk logic in the
 * app: the backend's refresh tokens are single-use (Redis SET NX,
 * RefreshTokenUseCase.ts) — sending the same one twice concurrently gets
 * TOKEN_REVOKED. These tests exist specifically to prove concurrent 401s
 * never cause that.
 */
describe('apiClient — 401 refresh mutex', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'stale-token',
      user: null,
      isAuthenticated: true,
      isRestoring: false,
    });
    storageService.setRefreshToken('refresh-token-1');
  });

  afterEach(() => {
    storageService.clearRefreshToken();
  });

  it('shares a single /auth/refresh call across concurrent 401s and retries both requests', async () => {
    let refreshCalls = 0;

    const protectedHandler = (label: string) =>
      http.get(url(`/protected/${label}`), ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer fresh-token') {
          return HttpResponse.json({ success: true, data: { ok: label } });
        }
        return HttpResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
          { status: 401 },
        );
      });

    server.use(
      protectedHandler('a'),
      protectedHandler('b'),
      http.post(url('/auth/refresh'), async () => {
        refreshCalls += 1;
        // Latency wide enough that both 401s are guaranteed to be handled
        // while the first refresh call is still in flight.
        await new Promise((resolve) => setTimeout(resolve, 20));
        return HttpResponse.json({
          success: true,
          data: {
            accessToken: 'fresh-token',
            refreshToken: 'refresh-token-2',
            expiresAt: new Date().toISOString(),
          },
        });
      }),
    );

    const [a, b] = await Promise.all([
      apiClient.get('/protected/a'),
      apiClient.get('/protected/b'),
    ]);

    expect(refreshCalls).toBe(1);
    expect(a.data.data.ok).toBe('a');
    expect(b.data.data.ok).toBe('b');
    expect(storageService.getRefreshToken()).toBe('refresh-token-2');
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
  });

  it('clears the session when refresh fails outright', async () => {
    server.use(
      http.get(url('/protected/c'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
          { status: 401 },
        ),
      ),
      http.post(url('/auth/refresh'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'TOKEN_REVOKED', message: 'Refresh token has already been used.' } },
          { status: 401 },
        ),
      ),
    );

    await expect(apiClient.get('/protected/c')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(storageService.getRefreshToken()).toBeNull();
  });

  it('never attempts a refresh for a 401 from /auth/login itself', async () => {
    let refreshCalled = false;
    server.use(
      http.post(url('/auth/login'), () =>
        HttpResponse.json(
          { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } },
          { status: 401 },
        ),
      ),
      http.post(url('/auth/refresh'), () => {
        refreshCalled = true;
        return HttpResponse.json({ success: false, error: { code: 'TOKEN_INVALID', message: 'x' } }, { status: 401 });
      }),
    );

    await expect(
      apiClient.post('/auth/login', { email: 'a@b.com', password: 'x' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(refreshCalled).toBe(false);
  });

  it('normalizes the real backend error envelope, including field-level details', async () => {
    server.use(
      http.post(url('/protected/validate'), () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed.',
              details: [{ field: 'email', message: 'Must be a valid email address.' }],
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(apiClient.post('/protected/validate', {})).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      details: [{ field: 'email', message: 'Must be a valid email address.' }],
    });
  });

  it('normalizes connection failures to a NETWORK code', async () => {
    server.use(http.get(url('/protected/unreachable'), () => HttpResponse.error()));

    await expect(apiClient.get('/protected/unreachable')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK',
    });
  });
});
