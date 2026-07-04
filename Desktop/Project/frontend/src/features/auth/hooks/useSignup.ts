import { useMutation } from '@tanstack/react-query';
import { storageService } from '@/services/storageService';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/stores/authStore';
import type { RegisterRequest } from '../types/auth.types';

/**
 * POST /auth/register returns only {userId, email} — no tokens
 * (RegisterUseCase.ts deliberately does not authenticate on signup). We
 * chain an explicit login call with the same credentials so signup still
 * feels like one step, without inventing a backend contract that doesn't
 * exist.
 */
export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      await authApi.register(payload);
      return authApi.login(payload);
    },
    onSuccess: (data) => {
      storageService.setRefreshToken(data.refreshToken);
      setSession(data.accessToken, { userId: data.userId, email: data.email });
    },
  });
}
