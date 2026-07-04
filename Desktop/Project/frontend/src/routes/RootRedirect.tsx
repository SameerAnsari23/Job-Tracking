import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';

/** "/" is auth-aware: settled by SessionGate before this ever renders. */
export function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
