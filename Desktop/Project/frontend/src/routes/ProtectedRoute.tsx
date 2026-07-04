import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * If not authenticated, redirect to /login preserving the attempted URL as
 * a `?from=` query param so login can return the user to where they were
 * headed. A query param (not router `state`) survives a manual reload of
 * the /login URL and is immune to redirect-chain races that can drop
 * history state (GuestRoute's own redirect fires the same instant login
 * succeeds). No isLoading branch is needed — SessionGate guarantees
 * settled auth state before any route renders.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />;
  }

  return <Outlet />;
}
