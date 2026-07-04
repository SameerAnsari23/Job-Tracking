import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isRestoring: true,
    });
  });

  it('starts restoring with no session', () => {
    const state = useAuthStore.getState();
    expect(state.isRestoring).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('setSession authenticates and stores the full known profile', () => {
    useAuthStore.getState().setSession('token-1', { userId: 'u1', email: 'a@b.com' });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('token-1');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('setAccessToken rotates the token without touching the known user', () => {
    useAuthStore.getState().setSession('token-1', { userId: 'u1', email: 'a@b.com' });
    useAuthStore.getState().setAccessToken('token-2');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('token-2');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({ userId: 'u1', email: 'a@b.com' });
  });

  it('setUser hydrates profile without touching the token', () => {
    useAuthStore.getState().setAccessToken('token-1');
    useAuthStore.getState().setUser({ userId: 'u1', email: null });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('token-1');
    expect(state.user).toEqual({ userId: 'u1', email: null });
  });

  it('clearAuth resets token, user, and authentication status', () => {
    useAuthStore.getState().setSession('token-1', { userId: 'u1', email: 'a@b.com' });
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setRestoring toggles independently of session state', () => {
    useAuthStore.getState().setRestoring(false);
    expect(useAuthStore.getState().isRestoring).toBe(false);
    useAuthStore.getState().setRestoring(true);
    expect(useAuthStore.getState().isRestoring).toBe(true);
  });
});
