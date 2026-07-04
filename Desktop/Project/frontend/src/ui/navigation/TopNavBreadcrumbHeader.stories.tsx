import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { TopNavigation } from './TopNavigation';
import { Breadcrumb } from './Breadcrumb';
import { PageHeader } from './PageHeader';
import { Tabs } from './Tabs';
import { Button } from '../foundation/Button';
import { Icon } from '../foundation/Icon';
import { Avatar } from '../foundation/Avatar';
import { Typography } from '../foundation/Typography';

const meta: Meta = { title: 'Navigation/TopNav · Breadcrumb · PageHeader' };
export default meta;

export const TopNav: StoryObj = {
  render: () => (
    <TopNavigation
      start={
        <Typography variant="h6" as="span">
          ◆ JobNotify
        </Typography>
      }
      actions={
        <Button variant="ghost" iconOnly aria-label="Settings">
          <Icon name="settings" size={18} />
        </Button>
      }
      notifications={
        <Button variant="ghost" iconOnly aria-label="Notifications">
          <Icon name="bell" size={18} />
        </Button>
      }
      profile={<Avatar name="Sam Ansari" size={30} />}
    />
  ),
};

export const Breadcrumbs: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, p: 6 }}>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
          { label: 'Job Search', href: '/jobs' },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discovery', href: '/discovery' },
          { label: 'Backend Engineer', href: '/discovery/1' },
          { label: 'Edit profile', href: '/discovery/1/edit' },
          { label: 'Target roles' },
        ]}
      />
    </Box>
  ),
};

export const PageHeaders: StoryObj = {
  render: () => (
    <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PageHeader
        title="Discovery"
        description="Automated matching across every source you watch."
        actions={<Button>New profile</Button>}
      />
      <PageHeader
        title="Profile"
        backHref="/dashboard"
        tabs={
          <Tabs
            aria-label="Profile sections"
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'experience', label: 'Experience' },
              { value: 'skills', label: 'Skills', count: 12 },
            ]}
            defaultValue="overview"
          />
        }
      />
    </Box>
  ),
};
