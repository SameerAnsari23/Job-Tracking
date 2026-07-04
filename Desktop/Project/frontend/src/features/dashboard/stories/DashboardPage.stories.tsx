import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { DashboardPage } from '../pages/DashboardPage';
import {
  dashboardSuccessHandlers,
  dashboardLoadingHandlers,
  dashboardErrorHandlers,
  dashboardEmptyHandlers,
} from '../tests/mocks/dashboardHandlers';

function withUser() {
  useAuthStore.setState({
    user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
    accessToken: 'demo',
    isAuthenticated: true,
    isRestoring: false,
  });
}

const meta: Meta<typeof DashboardPage> = {
  title: 'Features/Dashboard/DashboardPage',
  component: DashboardPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DashboardPage>;

export const Complete: Story = {
  parameters: { msw: { handlers: dashboardSuccessHandlers } },
  render: () => {
    withUser();
    return <DashboardPage />;
  },
};

export const Loading: Story = {
  parameters: { msw: { handlers: dashboardLoadingHandlers } },
  render: () => {
    withUser();
    return <DashboardPage />;
  },
};

export const Empty: Story = {
  parameters: { msw: { handlers: dashboardEmptyHandlers } },
  render: () => {
    withUser();
    return <DashboardPage />;
  },
};

export const WidgetErrors: Story = {
  parameters: { msw: { handlers: dashboardErrorHandlers } },
  render: () => {
    withUser();
    return <DashboardPage />;
  },
};

export const MobileViewport: Story = {
  parameters: {
    msw: { handlers: dashboardSuccessHandlers },
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => {
    withUser();
    return <DashboardPage />;
  },
};
