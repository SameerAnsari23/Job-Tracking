import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Timeline } from './Timeline';
import { ActivityFeed } from './ActivityFeed';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from './NotificationItem';

const meta: Meta = { title: 'Data Display/Timeline · ActivityFeed · NotificationItem' };
export default meta;

export const TimelineExperience: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <Timeline
        items={[
          {
            id: '1',
            current: true,
            title: 'Senior Product Manager',
            timestamp: '2023 — Present',
            description: 'Leading the platform team.',
          },
          {
            id: '2',
            title: 'Product Manager',
            timestamp: '2020 — 2023',
            expandable: true,
            description: 'Owned onboarding and activation.',
          },
          { id: '3', icon: 'check', tone: 'success', title: 'Profile created', timestamp: '2020' },
        ]}
      />
    </Box>
  ),
};

export const TimelineGrouped: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <Timeline
        items={[
          { id: '1', group: 'Today', title: 'Discovery activated', timestamp: '2h ago' },
          { id: '2', group: 'Today', title: 'New match found', timestamp: '3h ago' },
          { id: '3', group: 'Yesterday', title: 'Profile updated', timestamp: '1d ago' },
        ]}
      />
    </Box>
  ),
};

export const TimelineExpandInteraction: StoryObj = {
  render: () => (
    <Timeline
      items={[
        {
          id: '1',
          title: 'Product Manager',
          expandable: true,
          description: 'Full description here.',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Full description here.')).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Show details' }));
    await expect(canvas.getByText('Full description here.')).toBeVisible();
  },
};

export const ActivityFeedStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      <ActivityFeed
        items={[
          {
            id: '1',
            tone: 'accent',
            text: 'New match at Stripe',
            timestamp: '2h ago',
            href: '/jobs/1',
          },
          { id: '2', tone: 'success', text: 'Job saved', timestamp: '5h ago' },
          { id: '3', tone: 'warning', text: 'Saved job expired', timestamp: '1d ago' },
        ]}
        footerHref="/notifications"
      />
      <ActivityFeed items={[]} loading />
      <ActivityFeed items={[]} />
      <ActivityFeed items={[]} error="Couldn't load activity" onRetry={() => {}} />
    </Box>
  ),
};

const NOTIF: NotificationData = {
  id: '1',
  icon: 'star',
  title: 'New match: Senior Engineer at Notion',
  body: 'Matches your Backend Engineer profile',
  timestamp: '3 hours ago',
  read: false,
};

export const NotificationItems: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}>
      <NotificationItem notification={NOTIF} onRead={() => {}} onDelete={() => {}} />
      <NotificationItem notification={{ ...NOTIF, id: '2', read: true }} onDelete={() => {}} />
      <NotificationItem
        notification={{ ...NOTIF, id: '3', avatarSrc: undefined }}
        density="drawer"
        onDelete={() => {}}
      />
    </Box>
  ),
};

function NotificationReadInteractionDemo() {
  const [notif, setNotif] = useState(NOTIF);
  return (
    <NotificationItem notification={notif} onRead={() => setNotif((n) => ({ ...n, read: true }))} />
  );
}

export const NotificationReadInteraction: StoryObj = {
  render: () => <NotificationReadInteractionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /New match/ });
    await expect(canvas.getByRole('status', { name: 'Unread' })).toBeInTheDocument();
    await userEvent.click(row);
    await expect(canvas.queryByRole('status', { name: 'Unread' })).not.toBeInTheDocument();
  },
};
