import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

/**
 * Its own lazy chunk (Phase 18.3, following the Dashboard/AppLayout
 * pattern from Phases 18.1/18.2) — AppLayout's own Outlet Suspense
 * (AppLayout.tsx) already covers this; no extra boundary needed here.
 */
const DiscoveryPage = lazy(() =>
  import('../pages/DiscoveryPage').then((m) => ({ default: m.DiscoveryPage })),
);

export const discoveryRoutes: RouteObject[] = [{ path: '/discovery', element: <DiscoveryPage /> }];
