import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { DiscoveryPage } from '../pages/DiscoveryPage';
import {
  discoverySuccessHandlers,
  discoveryLoadingHandlers,
  discoveryErrorHandlers,
  discoveryEmptyHandlers,
  discoveryMutationHandlers,
} from '../tests/mocks/discoveryHandlers';

function withUser() {
  useAuthStore.setState({
    user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
    accessToken: 'demo',
    isAuthenticated: true,
    isRestoring: false,
  });
}

const meta: Meta<typeof DiscoveryPage> = {
  title: 'Features/Discovery/DiscoveryPage',
  component: DiscoveryPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/discovery']}>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof DiscoveryPage>;

export const Complete: Story = {
  parameters: { msw: { handlers: [...discoverySuccessHandlers, ...discoveryMutationHandlers] } },
  render: () => {
    withUser();
    return <DiscoveryPage />;
  },
};

export const Loading: Story = {
  parameters: { msw: { handlers: discoveryLoadingHandlers } },
  render: () => {
    withUser();
    return <DiscoveryPage />;
  },
};

export const Onboarding: Story = {
  parameters: { msw: { handlers: discoveryEmptyHandlers } },
  render: () => {
    withUser();
    return <DiscoveryPage />;
  },
};

export const WidgetErrors: Story = {
  parameters: { msw: { handlers: discoveryErrorHandlers } },
  render: () => {
    withUser();
    return <DiscoveryPage />;
  },
};

export const MobileViewport: Story = {
  parameters: {
    msw: { handlers: [...discoverySuccessHandlers, ...discoveryMutationHandlers] },
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => {
    withUser();
    return <DiscoveryPage />;
  },
};
