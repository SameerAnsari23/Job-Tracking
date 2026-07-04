import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { env } from './env';
import { queryClient } from './queryClient';
import { SessionGate } from './SessionGate';
import { AppErrorBoundary } from '@/shared/components/AppErrorBoundary';
import { useUiStore } from '@/shared/stores/uiStore';
import { lightTheme, darkTheme } from '@/theme/theme';

interface Props {
  children: ReactNode;
}

/**
 * The provider stack — exact order per Phase 16.5 §2. This is the one file
 * where provider order lives; each position is justified there.
 *
 *  1 AppErrorBoundary  — catches crashes in any provider below
 *  2 ThemeProvider     — every styled surface (incl. inner fallbacks) gets tokens
 *  3 QueryClientProvider — session restoration and routes consume queries
 *  4 MotionConfig      — reducedMotion="user" enforced globally for Framer
 *  5 SessionGate       — auth resolved before any route/guard evaluates
 *  6 (RouterProvider mounts as children, in App.tsx)
 *  7 Toaster           — outside route boundaries, inside theme
 *  8 Devtools          — dev only, tree-shaken in production
 */
export function Providers({ children }: Props) {
  const themeMode = useUiStore((s) => s.themeMode);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    const resolved = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, prefersDark]);

  return (
    <AppErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">
            <SessionGate>{children}</SessionGate>
          </MotionConfig>
          <Toaster position="bottom-right" gutter={8} />
          {env.enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
