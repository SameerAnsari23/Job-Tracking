import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Sidebar } from './Sidebar';
import { SidebarGroup } from './SidebarGroup';
import { SidebarItem } from './SidebarItem';
import { SidebarFooter } from './SidebarFooter';
import { SidebarCollapseButton } from './SidebarCollapseButton';
import { Avatar } from '../foundation/Avatar';
import { Typography } from '../foundation/Typography';

const meta: Meta = { title: 'Navigation/Sidebar' };
export default meta;

function Demo({ initialCollapsed = false }: { initialCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [active, setActive] = useState('discovery');

  return (
    <Box sx={{ height: 560, display: 'flex' }}>
      <Sidebar
        collapsed={collapsed}
        header={
          <Typography variant="h6" color="inherit" as="span">
            {collapsed ? '◆' : '◆ JobNotify'}
          </Typography>
        }
        footer={
          <SidebarFooter>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar name="Sam Ansari" size={24} />
              {!collapsed && (
                <Typography variant="textSm" color="inherit" as="span">
                  Sam A.
                </Typography>
              )}
              <Box sx={{ ml: 'auto' }}>
                <SidebarCollapseButton
                  collapsed={collapsed}
                  onToggle={() => setCollapsed((c) => !c)}
                />
              </Box>
            </Box>
          </SidebarFooter>
        }
      >
        <SidebarGroup label="Workspace">
          <SidebarItem
            icon="dashboard"
            label="Dashboard"
            active={active === 'dashboard'}
            onClick={() => setActive('dashboard')}
          />
          <SidebarItem
            icon="briefcase"
            label="Job Search"
            active={active === 'jobs'}
            onClick={() => setActive('jobs')}
          />
          <SidebarItem
            icon="radar"
            label="Discovery"
            active={active === 'discovery'}
            onClick={() => setActive('discovery')}
          />
          <SidebarItem
            icon="bell"
            label="Notifications"
            badge={3}
            active={active === 'notifications'}
            onClick={() => setActive('notifications')}
          />
        </SidebarGroup>
        <SidebarGroup label="Personal">
          <SidebarItem
            icon="bookmark"
            label="Saved Jobs"
            active={active === 'saved'}
            onClick={() => setActive('saved')}
          />
          <SidebarItem icon="compass" label="Recommendations" disabled />
        </SidebarGroup>
      </Sidebar>
      <Box sx={{ flex: 1, p: 6, bgcolor: 'background.default' }}>
        <Typography variant="textSm" color="secondary">
          Page content area
        </Typography>
      </Box>
    </Box>
  );
}

export const Expanded: StoryObj = { render: () => <Demo /> };
export const Collapsed: StoryObj = { render: () => <Demo initialCollapsed /> };

export const ArrowKeyNavigation: StoryObj = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dashboard = canvas.getByRole('button', { name: 'Dashboard' });
    dashboard.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('button', { name: 'Job Search' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(canvas.getByRole('button', { name: /Discovery/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByRole('button', { name: /Notifications/ })).toHaveFocus();
  },
};

export const CollapseToggle: StoryObj = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Collapse sidebar' });
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    // Labels are removed from the accessible name once collapsed is applied
    // via CSS, but the link itself keeps its own text for the tooltip.
    await expect(canvas.getByRole('navigation')).toHaveAttribute('data-state', 'collapsed');
  },
};
