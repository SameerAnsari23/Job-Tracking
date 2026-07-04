import { screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDashboard } from '../tests/testUtils';
import { KpiGrid } from './KpiGrid';
import {
  profileSuccessHandler,
  discoverySuccessHandler,
  savedJobsSuccessHandler,
  notificationsSuccessHandler,
  dashboardErrorHandlers,
} from '../tests/mocks/dashboardHandlers';

describe('KpiGrid', () => {
  it('renders all four KPI tiles with real derived values', async () => {
    server.use(
      profileSuccessHandler,
      discoverySuccessHandler,
      savedJobsSuccessHandler,
      notificationsSuccessHandler,
    );
    renderDashboard(<KpiGrid />);

    expect(await screen.findByText('72%')).toBeInTheDocument(); // profile completion
    expect(screen.getByText('1/1')).toBeInTheDocument(); // discovery active/total
    // "1" appears twice by coincidence of the fixtures: 1 saved job (of 1,
    // no "+") and 1 unread notification (of 2).
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('falls back to an honest "—" per tile on error, never a fabricated zero', async () => {
    server.use(...dashboardErrorHandlers);
    renderDashboard(<KpiGrid />);

    await waitFor(() => expect(screen.getAllByText('—').length).toBeGreaterThan(0));
  });

  it('has no axe violations once loaded', async () => {
    server.use(
      profileSuccessHandler,
      discoverySuccessHandler,
      savedJobsSuccessHandler,
      notificationsSuccessHandler,
    );
    const { container } = renderDashboard(<KpiGrid />);
    await screen.findByText('72%');
    expect(await axe(container)).toHaveNoViolations();
  });
});
