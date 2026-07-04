import type { Meta, StoryObj } from '@storybook/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { AppLayout } from './AppLayout';

function DemoPage() {
  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ fontSize: 24, fontWeight: 600, mb: 2 }}>Dashboard</Box>
      <Box sx={{ color: 'text.secondary' }}>Page content renders here via the router's Outlet.</Box>
    </Box>
  );
}

function ShellDemo() {
  const router = createMemoryRouter(
    [{ path: '/dashboard', element: <AppLayout />, children: [{ index: true, element: <DemoPage /> }] }],
    { initialEntries: ['/dashboard'] },
  );
  return <RouterProvider router={router} />;
}

const meta: Meta = {
  title: 'Layouts/AppShell',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const DesktopExpanded: Story = {
  parameters: { viewport: { defaultViewport: 'responsive' } },
  render: () => {
    useAuthStore.setState({
      user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
      accessToken: 'demo',
      isAuthenticated: true,
      isRestoring: false,
    });
    useUiStore.setState({ sidebarCollapsed: false });
    return <ShellDemo />;
  },
};

export const DesktopCollapsed: Story = {
  render: () => {
    useAuthStore.setState({
      user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
      accessToken: 'demo',
      isAuthenticated: true,
      isRestoring: false,
    });
    useUiStore.setState({ sidebarCollapsed: true });
    return <ShellDemo />;
  },
};

export const MobileDrawer: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => {
    useAuthStore.setState({
      user: { userId: 'u1', email: 'sam@expertbridge.co.in' },
      accessToken: 'demo',
      isAuthenticated: true,
      isRestoring: false,
    });
    return <ShellDemo />;
  },
};
