import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/**
 * If authenticated, redirect away from auth-only pages (login/signup/...)
 * so signed-in users never land on them. Auth state is always settled here
 * because SessionGate resolves it above the router.
 *
 * Respects `?from=` when present (see ProtectedRoute) so whichever redirect
 * wins the race the instant login succeeds — this guard's own re-render, or
 * LoginForm's explicit post-submit navigate — lands on the same page.
 */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = new URLSearchParams(location.search).get('from');
    return <Navigate to={from || '/dashboard'} replace />;
  }
  return <Outlet />;
}
