import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { MemoryRouter } from 'react-router-dom';
import { KpiGrid } from '../components/KpiGrid';
import { OnboardingProgressWidget } from '../components/OnboardingProgressWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { DiscoverySummaryWidget } from '../components/DiscoverySummaryWidget';
import { NotificationSummaryWidget } from '../components/NotificationSummaryWidget';
import { QuickActionsWidget } from '../components/QuickActionsWidget';
import {
  profileSuccessHandler,
  discoverySuccessHandler,
  recommendationsSuccessHandler,
  savedJobsSuccessHandler,
  notificationsSuccessHandler,
  dashboardEmptyHandlers,
  dashboardErrorHandlers,
  dashboardLoadingHandlers,
} from '../tests/mocks/dashboardHandlers';

const meta: Meta = {
  title: 'Features/Dashboard/Widgets',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <Box sx={{ maxWidth: 480, p: 4 }}>
          <Story />
        </Box>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const KpiGridLoaded: Story = {
  parameters: {
    msw: {
      handlers: [
        profileSuccessHandler,
        discoverySuccessHandler,
        savedJobsSuccessHandler,
        notificationsSuccessHandler,
      ],
    },
  },
  render: () => <KpiGrid />,
};
export const KpiGridLoading: Story = {
  parameters: { msw: { handlers: dashboardLoadingHandlers } },
  render: () => <KpiGrid />,
};
export const KpiGridError: Story = {
  parameters: { msw: { handlers: dashboardErrorHandlers } },
  render: () => <KpiGrid />,
};

export const OnboardingLoaded: Story = {
  parameters: { msw: { handlers: [profileSuccessHandler] } },
  render: () => <OnboardingProgressWidget />,
};
export const OnboardingLoading: Story = {
  parameters: { msw: { handlers: [dashboardLoadingHandlers[0]!] } },
  render: () => <OnboardingProgressWidget />,
};
export const OnboardingError: Story = {
  parameters: { msw: { handlers: [dashboardErrorHandlers[0]!] } },
  render: () => <OnboardingProgressWidget />,
};

export const RecentActivityLoaded: Story = {
  parameters: { msw: { handlers: [recommendationsSuccessHandler] } },
  render: () => <RecentActivityWidget />,
};
export const RecentActivityEmpty: Story = {
  parameters: { msw: { handlers: [dashboardEmptyHandlers[2]!] } },
  render: () => <RecentActivityWidget />,
};
export const RecentActivityError: Story = {
  parameters: { msw: { handlers: [dashboardErrorHandlers[2]!] } },
  render: () => <RecentActivityWidget />,
};

export const DiscoverySummaryLoaded: Story = {
  parameters: { msw: { handlers: [discoverySuccessHandler] } },
  render: () => <DiscoverySummaryWidget />,
};
export const DiscoverySummaryEmpty: Story = {
  parameters: { msw: { handlers: [dashboardEmptyHandlers[1]!] } },
  render: () => <DiscoverySummaryWidget />,
};
export const DiscoverySummaryError: Story = {
  parameters: { msw: { handlers: [dashboardErrorHandlers[1]!] } },
  render: () => <DiscoverySummaryWidget />,
};

export const NotificationSummaryLoaded: Story = {
  parameters: { msw: { handlers: [notificationsSuccessHandler] } },
  render: () => <NotificationSummaryWidget />,
};
export const NotificationSummaryEmpty: Story = {
  parameters: { msw: { handlers: [dashboardEmptyHandlers[4]!] } },
  render: () => <NotificationSummaryWidget />,
};
export const NotificationSummaryError: Story = {
  parameters: { msw: { handlers: [dashboardErrorHandlers[4]!] } },
  render: () => <NotificationSummaryWidget />,
};

export const QuickActions: Story = { render: () => <QuickActionsWidget /> };
