import { apiClient } from '@/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  CurrentUserResponse,
} from '../types/auth.types';

interface Envelope<T> {
  success: true;
  data: T;
}

/**
 * Typed wrappers over the confirmed backend contracts (AuthController.ts).
 * The ONLY module in this feature that touches the Axios client directly.
 */
export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<Envelope<LoginResponse>>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<Envelope<RegisterResponse>>('/auth/register', payload);
    return data.data;
  },

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const { data } = await apiClient.post<Envelope<RefreshTokenResponse>>('/auth/refresh', {
      refreshToken,
    });
    return data.data;
  },

  /** Backend responds 204 No Content — nothing to return. */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const { data } = await apiClient.get<Envelope<CurrentUserResponse>>('/auth/me');
    return data.data;
  },
};
