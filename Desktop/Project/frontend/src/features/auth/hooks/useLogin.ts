import { useMutation } from '@tanstack/react-query';
import { storageService } from '@/services/storageService';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/stores/authStore';
import type { LoginRequest } from '../types/auth.types';

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    onSuccess: (data) => {
      storageService.setRefreshToken(data.refreshToken);
      setSession(data.accessToken, { userId: data.userId, email: data.email });
    },
  });
}
