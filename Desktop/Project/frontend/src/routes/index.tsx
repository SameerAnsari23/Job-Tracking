import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { isEnabled } from '@/app/flags';
import { authRoutes } from '@/features/auth/routes';
import { dashboardRoutes } from '@/features/dashboard/routes';
import { discoveryRoutes } from '@/features/discovery/routes';
import { PageLoader } from '@/shared/components/PageLoader';
import { RootRedirect } from './RootRedirect';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout/AdminLayout';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Container } from '@/ui/layout/Container';

/**
 * The authenticated shell is its own chunk (Phase 18.1): Sidebar,
 * TopNavigation, CommandPalette, Drawer, and Menu are real weight that a
 * signed-out visitor should never download. AppLayout's own Outlet has a
 * second, inner Suspense boundary (see AppLayout.tsx) for per-page
 * lazy-loading as real pages replace the placeholders below.
 */
const AppLayout = lazy(() =>
  import('@/layouts/AppLayout/AppLayout').then((m) => ({ default: m.AppLayout })),
);

/**
 * The route tree (Phase 16.1 routing structure, Phase 16.5 conventions).
 *
 * Bootstrap notes:
 *  - Pages are static placeholders; each becomes React.lazy when the real
 *    page lands with its milestone (the router boundary is the chunk
 *    boundary — splitting placeholder stubs would create empty chunks).
 *  - Auth pages (login/signup/forgot/reset) are real as of Phase 18.0 —
 *    see features/auth/routes. The authenticated shell is real as of
 *    Phase 18.1 — see layouts/AppLayout. The Dashboard is real as of
 *    Phase 18.2 — see features/dashboard/routes. Discovery is real as of
 *    Phase 18.3 — see features/discovery/routes.
 *  - /admin is excluded from the tree entirely unless the adminArea flag is
 *    on — flagged-off routes ship zero bytes.
 */
export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: authRoutes,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          ...dashboardRoutes,
          { path: '/jobs', element: <PlaceholderPage title="Job Search" phase="Phase M" /> },
          { path: '/jobs/saved', element: <PlaceholderPage title="Saved Jobs" phase="Phase M" /> },
          {
            path: '/jobs/recommendations',
            element: <PlaceholderPage title="Recommendations" phase="Phase M" />,
          },
          {
            path: '/jobs/:jobId',
            element: <PlaceholderPage title="Job Details" phase="Phase M" />,
          },
          ...discoveryRoutes,
          {
            path: '/notifications',
            element: <PlaceholderPage title="Notifications" phase="Phase N" />,
          },
          { path: '/profile', element: <PlaceholderPage title="Profile" phase="Phase K" /> },
          { path: '/settings', element: <PlaceholderPage title="Settings" phase="Phase O" /> },
          {
            path: '/settings/notifications',
            element: <PlaceholderPage title="Notification Settings" phase="Phase O" />,
          },
          {
            path: '/settings/job-search',
            element: <PlaceholderPage title="Job Search Settings" phase="Phase O" />,
          },
        ],
      },
    ],
  },

  ...(isEnabled('adminArea')
    ? [
        {
          element: <AdminRoute />,
          children: [
            {
              element: <AdminLayout />,
              children: [
                { path: '/admin', element: <Navigate to="/admin/health" replace /> },
                {
                  path: '/admin/health',
                  element: (
                    <Container>
                      <PlaceholderPage title="System Health" phase="Phase P" />
                    </Container>
                  ),
                },
                {
                  path: '/admin/providers',
                  element: (
                    <Container>
                      <PlaceholderPage title="Provider Monitoring" phase="Phase P" />
                    </Container>
                  ),
                },
                {
                  path: '/admin/queues',
                  element: (
                    <Container>
                      <PlaceholderPage title="Queue Monitoring" phase="Phase P" />
                    </Container>
                  ),
                },
                {
                  path: '/admin/workers',
                  element: (
                    <Container>
                      <PlaceholderPage title="Worker Monitoring" phase="Phase P" />
                    </Container>
                  ),
                },
              ],
            },
          ],
        },
      ]
    : []),

  {
    path: '*',
    element: (
      <Container>
        <PlaceholderPage title="404 — Page not found" phase="Phase C (shell)" />
      </Container>
    ),
  },
]);
