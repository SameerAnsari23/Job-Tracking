import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { lightTheme } from '@/theme';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

interface RenderAuthOptions {
  route?: string;
  queryClient?: QueryClient;
}

/**
 * Shared render helper for auth feature tests: theme + a fresh (non-caching
 * between tests) QueryClient + MemoryRouter. Reused across component,
 * routing, and integration tests so provider setup isn't duplicated.
 */
export function renderAuth(ui: ReactElement, options: RenderAuthOptions = {}): RenderResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
