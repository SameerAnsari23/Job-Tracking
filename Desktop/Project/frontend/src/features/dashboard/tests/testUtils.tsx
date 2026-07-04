import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lightTheme } from '@/theme';
import { useAuthStore } from '@/shared/stores/authStore';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function signIn(email = 'sam@expertbridge.co.in'): void {
  useAuthStore.setState({
    user: { userId: 'u1', email },
    accessToken: 'test-token',
    isAuthenticated: true,
    isRestoring: false,
  });
}

interface RenderDashboardOptions {
  route?: string;
  queryClient?: QueryClient;
}

export function renderDashboard(ui: ReactElement, options: RenderDashboardOptions = {}): RenderResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={[options.route ?? '/dashboard']}>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
