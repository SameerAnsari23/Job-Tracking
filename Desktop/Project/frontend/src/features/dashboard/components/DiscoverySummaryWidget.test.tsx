import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDashboard } from '../tests/testUtils';
import { DiscoverySummaryWidget } from './DiscoverySummaryWidget';
import {
  discoverySuccessHandler,
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
} from '../tests/mocks/dashboardHandlers';

describe('DiscoverySummaryWidget', () => {
  it('renders an active/total profile count and watched-company total derived from real data', async () => {
    server.use(discoverySuccessHandler);
    renderDashboard(<DiscoverySummaryWidget />);

    expect(
      await screen.findByText('1 of 1 profile active · watching 2 companies'),
    ).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows a setup empty state when there are no discovery profiles', async () => {
    server.use(dashboardEmptyHandlers[1]!);
    renderDashboard(<DiscoverySummaryWidget />);
    expect(await screen.findByText('No discovery profiles yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Set up discovery' })).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(dashboardErrorHandlers[1]!);
    renderDashboard(<DiscoverySummaryWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(discoverySuccessHandler);
    const { container } = renderDashboard(<DiscoverySummaryWidget />);
    await screen.findByText('Active');
    expect(await axe(container)).toHaveNoViolations();
  });
});
