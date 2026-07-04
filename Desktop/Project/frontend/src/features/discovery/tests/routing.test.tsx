import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { useAuthStore } from '@/shared/stores/authStore';
import { queryClient } from '@/app/queryClient';
import { router } from '@/routes';
import { App } from '@/app/App';
import {
  discoverySuccessHandlers,
  discoveryMutationHandlers,
  PREFERENCES_FIXTURE,
} from '../tests/mocks/discoveryHandlers';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

/**
 * Shell integration (Phase 18.3) — exercises the REAL router/App, mirroring
 * Dashboard's Phase 18.2 suite. `router.navigate()` (not raw pushState) is
 * required — createBrowserRouter captures window.location once, at module
 * evaluation time.
 */
async function renderAppAt(path: string) {
  await router.navigate(path);
  return render(<App />);
}

describe('Discovery — shell integration', () => {
  beforeEach(() => {
    queryClient.clear();
    useAuthStore.setState({
      user: { userId: 'u1', email: 'jane@example.com' },
      accessToken: 'test-token',
      isAuthenticated: true,
      isRestoring: false,
    });
    server.use(...discoverySuccessHandlers, ...discoveryMutationHandlers);
  });

  it('mounts inside the shell — sidebar and breadcrumb both present (discovery chunk lazy-loads)', async () => {
    await renderAppAt('/discovery');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Discovery' }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Discovery');
  }, 20000);

  it('keeps the sidebar mounted (same DOM node) when navigating to another shell route', async () => {
    await renderAppAt('/discovery');
    await screen.findByRole('heading', { level: 1, name: 'Discovery' }, { timeout: 8000 });
    const sidebarBefore = screen.getByRole('navigation', { name: 'Main' });

    await router.navigate('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 });
    const sidebarAfter = screen.getByRole('navigation', { name: 'Main' });

    expect(sidebarAfter).toBe(sidebarBefore);
  }, 20000);

  it('does not refetch discovery preferences when returning via Back within the cache window', async () => {
    let preferencesCalls = 0;
    server.use(
      http.get(url('/discovery'), () => {
        preferencesCalls += 1;
        return HttpResponse.json({ success: true, data: PREFERENCES_FIXTURE });
      }),
    );

    await renderAppAt('/discovery');
    await screen.findByRole('heading', { level: 1, name: 'Discovery' }, { timeout: 8000 });
    await waitFor(() => expect(preferencesCalls).toBe(1));

    await router.navigate('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 });

    await router.navigate('/discovery');
    await screen.findByRole('heading', { level: 1, name: 'Discovery' }, { timeout: 8000 });

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(preferencesCalls).toBe(1);
  }, 20000);
});
