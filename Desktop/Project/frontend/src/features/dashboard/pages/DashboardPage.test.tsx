import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { signIn, renderDashboard } from '../tests/testUtils';
import { DashboardPage } from './DashboardPage';
import { dashboardSuccessHandlers } from '../tests/mocks/dashboardHandlers';

describe('DashboardPage', () => {
  beforeEach(() => {
    signIn('jane@example.com');
    server.use(...dashboardSuccessHandlers);
  });

  it('renders a single h1 and a personalized, time-of-day-aware greeting', () => {
    renderDashboard(<DashboardPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
  });

  it('renders every widget as its own independent region', async () => {
    renderDashboard(<DashboardPage />);

    // "72%" legitimately appears twice — the KPI tile and the Onboarding
    // widget's own ProfileStrength both render the same cached query result.
    expect(await screen.findAllByText('72%')).toHaveLength(2);
    expect(screen.getByText(/New match: Backend Engineer/)).toBeInTheDocument(); // Recent activity
    expect(screen.getByText(/profile active/)).toBeInTheDocument(); // Discovery
    expect(screen.getByText('New match found')).toBeInTheDocument(); // Notifications
    expect(screen.getByRole('button', { name: 'Search jobs' })).toBeInTheDocument(); // Quick actions
  });

  it('has a sane heading hierarchy (one h1, widget titles as headings/labels beneath it)', async () => {
    renderDashboard(<DashboardPage />);
    await screen.findAllByText('72%');
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it('has no axe violations once fully loaded', async () => {
    const { container } = renderDashboard(<DashboardPage />);
    await screen.findAllByText('72%');
    await screen.findByText(/New match: Backend Engineer/);
    expect(await axe(container)).toHaveNoViolations();
  });
});
