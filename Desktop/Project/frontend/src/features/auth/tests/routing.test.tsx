import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

describe('GuestRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isRestoring: false });
  });

  it('renders the outlet when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>Login page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects an already-authenticated user to /dashboard', () => {
    useAuthStore.getState().setSession('t', { userId: 'u1', email: 'a@b.com' });
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<div>Login page</div>} />
          </Route>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, isRestoring: false });
  });

  it('renders the outlet when authenticated', () => {
    useAuthStore.getState().setSession('t', { userId: 'u1', email: 'a@b.com' });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to /login, preserving the attempted path as a ?from= query param', () => {
    render(
      <MemoryRouter initialEntries={['/jobs/saved']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/jobs/saved" element={<div>Saved Jobs</div>} />
          </Route>
          <Route path="/login" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>,
    );
    const location = screen.getByTestId('location');
    expect(location).toHaveTextContent('/login');
    expect(location).toHaveTextContent(encodeURIComponent('/jobs/saved'));
  });
});
