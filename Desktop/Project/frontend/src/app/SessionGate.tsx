import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/shared/stores/authStore';
import { restoreSession } from '@/features/auth/services/session.service';
import { PageLoader } from '@/shared/components/PageLoader';

interface Props {
  children: ReactNode;
}

/**
 * Runs the silent-refresh session restoration BEFORE the router renders, so
 * no guard ever evaluates against unknown auth state — eliminates any
 * flash-of-login-redirect for users with a valid persisted refresh token.
 */
export function SessionGate({ children }: Props) {
  const isRestoring = useAuthStore((s) => s.isRestoring);

  useEffect(() => {
    void restoreSession();
  }, []);

  if (isRestoring) return <PageLoader />;
  return <>{children}</>;
}
