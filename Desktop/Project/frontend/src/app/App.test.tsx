import { render, screen } from '@testing-library/react';
import { App } from './App';

/**
 * Bootstrap smoke test: the full provider stack and router mount, "/"
 * redirects to /login (guest default), and the login placeholder renders.
 * Exercises: env validation, theme resolution, QueryClientProvider,
 * SessionGate pass-through, route tree, AuthLayout.
 */
describe('application bootstrap', () => {
  it('renders the login placeholder at the root route', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getAllByText(/JobNotify/i).length).toBeGreaterThan(0);
  });
});
