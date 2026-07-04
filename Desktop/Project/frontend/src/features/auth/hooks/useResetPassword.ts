import { useMutation } from '@tanstack/react-query';
import type { ResetPasswordFormValues } from '../schemas/resetPassword.schema';

export interface ResetPasswordPayload extends ResetPasswordFormValues {
  token: string;
}

/**
 * SCAFFOLD (Phase 18.0) — no backend endpoint exists yet for completing a
 * password reset. Only reachable behind the `passwordReset` feature flag
 * (default OFF — app/flags.ts, src/routes/index.tsx). See
 * useForgotPassword.ts for the same rationale.
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      void payload;
      await new Promise((resolve) => setTimeout(resolve, 400));
    },
  });
}
