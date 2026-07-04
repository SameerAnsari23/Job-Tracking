import { Outlet } from 'react-router-dom';

/**
 * PLACEHOLDER — bootstrap pass-through.
 *
 * Final behavior: ProtectedRoute semantics plus an admin-role check.
 * The backend does not yet expose roles (/auth/me returns userId only),
 * so the entire /admin subtree is additionally excluded from the route
 * tree unless the `adminArea` feature flag is enabled — this guard is the
 * second layer, not the only one.
 */
export function AdminRoute() {
  return <Outlet />;
}
