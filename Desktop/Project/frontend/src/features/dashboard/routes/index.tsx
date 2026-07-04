import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/**
 * The Dashboard is its own lazy chunk (Phase 18.2, following the same
 * pattern Phase 18.1 established for AppLayout itself) — AppLayout's own
 * Outlet Suspense (AppLayout.tsx) already covers this; no extra Suspense
 * boundary is needed here.
 */
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);

export const dashboardRoutes: RouteObject[] = [{ path: '/dashboard', element: <DashboardPage /> }];
