import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { layout } from '@/theme';
import { useUiStore } from '@/shared/stores/uiStore';
import { PageLoader } from '@/shared/components/PageLoader';
import { Container } from '@/ui/layout/Container';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { AppMobileDrawer } from './AppMobileDrawer';
import { AppBottomNav } from './AppBottomNav';
import { PageTransition } from './PageTransition';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const MAIN_CONTENT_ID = 'main-content';

/**
 * The authenticated application shell (Phase 18.1). Every authenticated
 * feature renders inside this layout via the router's Outlet. Owns
 * structure and chrome only — no page here has business logic.
 *
 * Responsive tiers:
 *  - mobile   (< sm):  no persistent rail — hamburger → left Drawer, plus a
 *                       fixed bottom tab bar.
 *  - tablet   (sm–lg):  persistent sidebar, forced to the icon-only rail.
 *  - desktop+ (≥ lg):   persistent sidebar, expand/collapse is the user's
 *                       own choice (uiStore, persisted).
 */
export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const location = useLocation();

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const effectiveCollapsed = isTablet ? true : sidebarCollapsed;

  // Focus restoration after navigation: a screen-reader/keyboard user's
  // focus can otherwise be left on a node that just unmounted with the
  // previous page.
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  // Route changes never leave the mobile drawer open over the new page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="a"
        href={`#${MAIN_CONTENT_ID}`}
        sx={{
          position: 'absolute',
          left: 8,
          top: -48,
          zIndex: theme.zIndex.tooltip + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          px: 4,
          py: 2,
          borderRadius: 1,
          transition: 'top 0.15s ease-out',
          '&:focus-visible': { top: 8 },
        }}
      >
        Skip to content
      </Box>

      {!isMobile && (
        <AppSidebar
          collapsed={effectiveCollapsed}
          toggleable={!isTablet}
          onToggleCollapse={toggleSidebar}
        />
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppTopBar isMobile={isMobile} onOpenMobileNav={() => setMobileNavOpen(true)} />

        <Box
          component="main"
          id={MAIN_CONTENT_ID}
          ref={mainRef}
          tabIndex={-1}
          sx={{
            flex: 1,
            outline: 'none',
            paddingBottom: isMobile ? `${layout.bottomNavHeight}px` : 0,
          }}
        >
          <Container>
            <RouteErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </Suspense>
            </RouteErrorBoundary>
          </Container>
        </Box>
      </Box>

      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: theme.zIndex.appBar }}>
          <AppBottomNav />
        </Box>
      )}

      {isMobile && (
        <AppMobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      )}
    </Box>
  );
}
