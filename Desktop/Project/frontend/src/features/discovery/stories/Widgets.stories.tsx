import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { MemoryRouter } from 'react-router-dom';
import { DiscoveryStatusWidget } from '../components/DiscoveryStatusWidget';
import { DiscoveryProfilesWidget } from '../components/DiscoveryProfilesWidget';
import { WatchedCompaniesWidget } from '../components/WatchedCompaniesWidget';
import { AutomationSummaryWidget } from '../components/AutomationSummaryWidget';
import { ScheduleSummaryWidget } from '../components/ScheduleSummaryWidget';
import { DiscoveryActivityWidget } from '../components/DiscoveryActivityWidget';
import { QuickActionsWidget } from '../components/QuickActionsWidget';
import {
  preferencesSuccessHandler,
  preferencesEmptyHandler,
  preferencesErrorHandler,
  preferencesLoadingHandler,
  recommendationsSuccessHandler,
  recommendationsEmptyHandler,
  recommendationsErrorHandler,
  discoveryMutationHandlers,
} from '../tests/mocks/discoveryHandlers';

const meta: Meta = {
  title: 'Features/Discovery/Widgets',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/discovery']}>
        <Box sx={{ maxWidth: 480, p: 4 }}>
          <Story />
        </Box>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const StatusLoaded: Story = {
  parameters: { msw: { handlers: [preferencesSuccessHandler, ...discoveryMutationHandlers] } },
  render: () => <DiscoveryStatusWidget />,
};
export const StatusLoading: Story = {
  parameters: { msw: { handlers: [preferencesLoadingHandler] } },
  render: () => <DiscoveryStatusWidget />,
};
export const StatusError: Story = {
  parameters: { msw: { handlers: [preferencesErrorHandler] } },
  render: () => <DiscoveryStatusWidget />,
};

export const ProfilesLoaded: Story = {
  parameters: { msw: { handlers: [preferencesSuccessHandler, ...discoveryMutationHandlers] } },
  render: () => <DiscoveryProfilesWidget />,
};
export const ProfilesEmpty: Story = {
  parameters: { msw: { handlers: [preferencesEmptyHandler] } },
  render: () => <DiscoveryProfilesWidget />,
};
export const ProfilesError: Story = {
  parameters: { msw: { handlers: [preferencesErrorHandler] } },
  render: () => <DiscoveryProfilesWidget />,
};

export const WatchedCompaniesLoaded: Story = {
  parameters: { msw: { handlers: [preferencesSuccessHandler] } },
  render: () => <WatchedCompaniesWidget />,
};
export const WatchedCompaniesEmpty: Story = {
  parameters: { msw: { handlers: [preferencesEmptyHandler] } },
  render: () => <WatchedCompaniesWidget />,
};

export const AutomationSummaryLoaded: Story = {
  parameters: { msw: { handlers: [preferencesSuccessHandler] } },
  render: () => <AutomationSummaryWidget />,
};
export const AutomationSummaryError: Story = {
  parameters: { msw: { handlers: [preferencesErrorHandler] } },
  render: () => <AutomationSummaryWidget />,
};

export const ScheduleSummaryLoaded: Story = {
  parameters: { msw: { handlers: [preferencesSuccessHandler] } },
  render: () => <ScheduleSummaryWidget />,
};
export const ScheduleSummaryEmpty: Story = {
  parameters: { msw: { handlers: [preferencesEmptyHandler] } },
  render: () => <ScheduleSummaryWidget />,
};

export const ActivityLoaded: Story = {
  parameters: { msw: { handlers: [recommendationsSuccessHandler] } },
  render: () => <DiscoveryActivityWidget />,
};
export const ActivityEmpty: Story = {
  parameters: { msw: { handlers: [recommendationsEmptyHandler] } },
  render: () => <DiscoveryActivityWidget />,
};
export const ActivityError: Story = {
  parameters: { msw: { handlers: [recommendationsErrorHandler] } },
  render: () => <DiscoveryActivityWidget />,
};

export const QuickActions: Story = { render: () => <QuickActionsWidget /> };
