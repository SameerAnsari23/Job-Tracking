import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { storageService } from '@/services/storageService';
import { useAuthStore } from '@/shared/stores/authStore';
import { renderShell, signIn, createTestQueryClient } from './tests/testUtils';
import { UserMenu } from './UserMenu';

/** Unlike renderShell's single-route stub, /profile and /settings need real matches too. */
function renderWithMultipleRoutes() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<UserMenu />} />
          <Route path="/profile" element={<div>Profile page</div>} />
          <Route path="/settings" element={<div>Settings page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('UserMenu', () => {
  beforeEach(() => signIn('jane@example.com'));

  it('shows Profile, Settings, and Sign out, with Sign out last and destructive', async () => {
    const user = userEvent.setup();
    renderShell(<UserMenu />);

    await user.click(screen.getByRole('button', { name: 'Account menu' }));

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Profile', 'Settings', 'Sign out']);
  });

  it('navigates to /profile', async () => {
    const user = userEvent.setup();
    renderWithMultipleRoutes();

    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Profile' }));

    expect(await screen.findByText('Profile page')).toBeInTheDocument();
  });

  it('navigates to /settings', async () => {
    const user = userEvent.setup();
    renderWithMultipleRoutes();

    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Settings' }));

    expect(await screen.findByText('Settings page')).toBeInTheDocument();
  });

  it('signs out through the real logout flow and clears the session', async () => {
    storageService.setRefreshToken('refresh-1');
    server.use(http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })));

    const user = userEvent.setup();
    renderShell(<UserMenu />);

    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Sign out' }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
    expect(storageService.getRefreshToken()).toBeNull();
  });

  it('has no axe violations with the menu open', async () => {
    const user = userEvent.setup();
    const { container } = renderShell(<UserMenu />);
    await user.click(screen.getByRole('button', { name: 'Account menu' }));
    await screen.findAllByRole('menuitem');
    expect(await axe(container)).toHaveNoViolations();
  });
});
