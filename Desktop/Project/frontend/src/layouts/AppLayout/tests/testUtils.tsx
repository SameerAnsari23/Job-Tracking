import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme } from '@/theme';
import { useAuthStore } from '@/shared/stores/authStore';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Puts an authenticated user in the store — the shell assumes it always renders behind ProtectedRoute. */
export function signIn(email = 'sam@expertbridge.co.in'): void {
  useAuthStore.setState({
    user: { userId: 'u1', email },
    accessToken: 'test-token',
    isAuthenticated: true,
    isRestoring: false,
  });
}

interface RenderShellOptions {
  route?: string;
  content?: ReactElement;
}

/**
 * Renders a layout element (AppLayout, or one of its slots) inside the
 * provider stack it needs: theme, a fresh QueryClient, and a router with a
 * real nested route so `<Outlet/>` has something to render.
 */
export function renderShell(
  layoutElement: ReactElement,
  { route = '/dashboard', content = <div>Page content</div> }: RenderShellOptions = {},
): RenderResult {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={route} element={layoutElement}>
              <Route index element={content} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
