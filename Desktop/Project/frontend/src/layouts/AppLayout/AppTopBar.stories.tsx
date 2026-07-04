import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { AppTopBar } from './AppTopBar';
import { UserMenu } from './UserMenu';
import { ThemeSwitch } from './ThemeSwitch';

function withUser() {
  useAuthStore.setState({
    user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
    accessToken: 'demo',
    isAuthenticated: true,
    isRestoring: false,
  });
}

const meta: Meta = {
  title: 'Layouts/AppTopBar · UserMenu · ThemeSwitch',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/dashboard']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const Desktop: Story = {
  render: () => {
    withUser();
    return <AppTopBar isMobile={false} onOpenMobileNav={() => {}} />;
  },
};

export const Mobile: Story = {
  render: () => {
    withUser();
    return <AppTopBar isMobile onOpenMobileNav={() => {}} />;
  },
};

export const UserMenuOpen: Story = {
  render: () => {
    withUser();
    return <UserMenu />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Account menu' }));
    await expect(await within(document.body).findByText('Sign out')).toBeInTheDocument();
  },
};

export const ThemeSwitching: Story = {
  render: () => {
    withUser();
    return <ThemeSwitch />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const initialLabel = button.getAttribute('aria-label');
    await userEvent.click(button);
    await expect(button.getAttribute('aria-label')).not.toBe(initialLabel);
  },
};
