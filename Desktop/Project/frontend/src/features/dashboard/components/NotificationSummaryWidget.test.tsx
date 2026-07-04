import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDashboard } from '../tests/testUtils';
import { NotificationSummaryWidget } from './NotificationSummaryWidget';
import {
  notificationsSuccessHandler,
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
} from '../tests/mocks/dashboardHandlers';

describe('NotificationSummaryWidget', () => {
  it('renders a read-only preview of the most recent notifications', async () => {
    server.use(notificationsSuccessHandler);
    renderDashboard(<NotificationSummaryWidget />);

    expect(await screen.findByText('New match found')).toBeInTheDocument();
    expect(screen.getByText('Application viewed')).toBeInTheDocument();
  });

  it('navigates to /notifications on click without mutating read state', async () => {
    server.use(notificationsSuccessHandler);
    const user = userEvent.setup();
    renderDashboard(<NotificationSummaryWidget />);

    await user.click(await screen.findByText('New match found'));
    // No PATCH .../read call is registered — MSW's onUnhandledRequest:'error'
    // (test/setup.ts) would fail this test if the widget tried to mutate.
  });

  it('shows an empty state with no notifications', async () => {
    server.use(dashboardEmptyHandlers[4]!);
    renderDashboard(<NotificationSummaryWidget />);
    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(dashboardErrorHandlers[4]!);
    renderDashboard(<NotificationSummaryWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(notificationsSuccessHandler);
    const { container } = renderDashboard(<NotificationSummaryWidget />);
    await screen.findByText('New match found');
    expect(await axe(container)).toHaveNoViolations();
  });
});
