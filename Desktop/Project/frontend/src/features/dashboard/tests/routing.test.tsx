import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { useAuthStore } from '@/shared/stores/authStore';
import { queryClient } from '@/app/queryClient';
import { router } from '@/routes';
import { App } from '@/app/App';
import { dashboardSuccessHandlers, PROFILE_FIXTURE } from '../tests/mocks/dashboardHandlers';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

/**
 * Shell integration (Phase 18.2): exercises the REAL router/App, not a
 * harness stand-in, so a regression in how Dashboard composes with the
 * Phase 18.1 shell (lazy AppLayout, Sidebar, Breadcrumbs, query cache)
 * shows up here. `router.navigate()` (not raw pushState) is required —
 * see Phase 18.1's notes on why `createBrowserRouter` doesn't notice an
 * external pushState after construction.
 */
async function renderAppAt(path: string) {
  await router.navigate(path);
  return render(<App />);
}

describe('Dashboard — shell integration', () => {
  beforeEach(() => {
    // The app's queryClient is a module-level singleton (app/queryClient.ts)
    // shared across every test in the process — without clearing it, a
    // prior test's still-fresh cache entry can make a query never actually
    // refire here, which would make the "no unnecessary refetch" test below
    // pass for the wrong reason (or the call-counting test read 0 calls).
    queryClient.clear();
    useAuthStore.setState({
      user: { userId: 'u1', email: 'jane@example.com' },
      accessToken: 'test-token',
      isAuthenticated: true,
      isRestoring: false,
    });
    server.use(...dashboardSuccessHandlers);
  });

  it('mounts inside the shell — sidebar and breadcrumb both present (dashboard chunk lazy-loads)', async () => {
    await renderAppAt('/dashboard');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  }, 20000);

  it('keeps the sidebar mounted (same DOM node) when navigating to another shell route', async () => {
    await renderAppAt('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 });
    const sidebarBefore = screen.getByRole('navigation', { name: 'Main' });

    await router.navigate('/jobs');
    await screen.findByRole('heading', { level: 1, name: 'Job Search' }, { timeout: 8000 });
    const sidebarAfter = screen.getByRole('navigation', { name: 'Main' });

    expect(sidebarAfter).toBe(sidebarBefore);
  }, 20000);

  it('updates the breadcrumb trail when navigating to a nested shell route', async () => {
    await renderAppAt('/jobs/saved');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Saved Jobs' }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      /Dashboard.*Job Search.*Saved Jobs/s,
    );
  }, 20000);

  it('does not refetch dashboard data when returning via Back within the cache window', async () => {
    let profileCalls = 0;
    server.use(
      http.get(url('/profile/me'), () => {
        profileCalls += 1;
        return HttpResponse.json({ success: true, data: PROFILE_FIXTURE });
      }),
    );

    await renderAppAt('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 });
    await waitFor(() => expect(profileCalls).toBe(1));

    await router.navigate('/jobs');
    await screen.findByRole('heading', { level: 1, name: 'Job Search' }, { timeout: 8000 });

    await router.navigate('/dashboard');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' }, { timeout: 8000 });

    // The query is well within its 60s staleTime (app/queryClient.ts) —
    // remounting the widget must reuse the cache, not refire the request.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(profileCalls).toBe(1);
  }, 20000);
});
