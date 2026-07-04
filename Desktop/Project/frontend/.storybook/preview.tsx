import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { lightTheme, darkTheme } from '../src/theme/theme';
import '@fontsource-variable/inter';

// Boots the MSW browser worker (public/mockServiceWorker.js) so auth
// stories can mock login/signup/refresh/logout without a real backend.
initialize({ onUnhandledRequest: 'bypass' });

/**
 * Global Storybook decorators: every story renders inside the real theme.
 * The theme toolbar switches light/dark — the same token map as the app,
 * so stories cannot drift from production styling. A fresh QueryClient per
 * story keeps TanStack Query hook state isolated between stories.
 */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  loaders: [mswLoader],
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? darkTheme : lightTheme;
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Story />
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
