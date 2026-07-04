import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDashboard } from '../tests/testUtils';
import { RecentActivityWidget } from './RecentActivityWidget';
import {
  recommendationsSuccessHandler,
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
} from '../tests/mocks/dashboardHandlers';

describe('RecentActivityWidget', () => {
  it('renders recent job matches with a relative timestamp', async () => {
    server.use(recommendationsSuccessHandler);
    renderDashboard(<RecentActivityWidget />);

    expect(await screen.findByText('New match: Backend Engineer at Acme')).toBeInTheDocument();
    expect(screen.getByText('New match: Platform Engineer at Globex')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/jobs');
  });

  it('shows an honest empty state when there are no matches', async () => {
    server.use(dashboardEmptyHandlers[2]!);
    renderDashboard(<RecentActivityWidget />);
    expect(await screen.findByText('No new matches yet')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(dashboardErrorHandlers[2]!);
    renderDashboard(<RecentActivityWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(recommendationsSuccessHandler);
    const { container } = renderDashboard(<RecentActivityWidget />);
    await screen.findByText('New match: Backend Engineer at Acme');
    expect(await axe(container)).toHaveNoViolations();
  });
});
