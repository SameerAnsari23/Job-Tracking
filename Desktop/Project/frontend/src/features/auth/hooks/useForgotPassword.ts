import { useMutation } from '@tanstack/react-query';
import type { ForgotPasswordFormValues } from '../schemas/forgotPassword.schema';

/**
 * SCAFFOLD (Phase 18.0) — no backend endpoint exists yet for password-reset
 * requests. Only reachable behind the `passwordReset` feature flag (default
 * OFF — app/flags.ts, src/routes/index.tsx). Deliberately does NOT call the
 * network: inventing a fake endpoint would violate "do not redesign backend
 * contracts." Replace this mutationFn with a real authApi call the moment
 * POST /auth/forgot-password exists.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordFormValues) => {
      void payload;
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  });
}
