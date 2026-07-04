import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { renderAuth, createTestQueryClient } from './testUtils';
import { LogoutButton } from '../components/LogoutButton';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('LogoutButton integration', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession('token-1', { userId: 'u1', email: 'a@b.com' });
    storageService.setRefreshToken('refresh-1');
  });

  it('revokes the refresh token, clears the session, and clears the query cache', async () => {
    server.use(http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })));

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['auth', 'me'], { userId: 'u1' });

    const user = userEvent.setup();
    renderAuth(<LogoutButton />, { queryClient });

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
    expect(storageService.getRefreshToken()).toBeNull();
    expect(queryClient.getQueryData(['auth', 'me'])).toBeUndefined();
  });

  it('calls onLoggedOut after a successful sign-out', async () => {
    server.use(http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })));
    const onLoggedOut = vi.fn();
    const user = userEvent.setup();
    renderAuth(<LogoutButton onLoggedOut={onLoggedOut} />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(onLoggedOut).toHaveBeenCalledOnce());
  });
});
