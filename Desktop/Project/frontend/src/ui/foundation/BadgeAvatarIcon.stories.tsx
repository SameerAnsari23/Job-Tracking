import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Typography } from './Typography';

/**
 * Grouped display-token stories: Badge, Avatar, Icon share a compact
 * showcase since each is a single-purpose visual atom.
 */
const meta: Meta = { title: 'Foundation/Badge · Avatar · Icon' };
export default meta;

export const Badges: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Badge tone="success">Active</Badge>
        <Badge tone="warning">Expiring</Badge>
        <Badge tone="error">High priority</Badge>
        <Badge tone="neutral">Paused</Badge>
        <Badge tone="accent">New</Badge>
      </Box>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Badge tone="accent" dot srLabel="Unread" />
        <Badge tone="success" dot srLabel="Online" />
        <Typography variant="textSm" color="secondary">
          dot mode (8px) — srLabel required
        </Typography>
      </Box>
    </Box>
  ),
};

export const Avatars: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
      <Avatar name="Sam Ansari" size={24} />
      <Avatar name="Sam Ansari" size={30} />
      <Avatar name="Sam Ansari" size={40} status="online" />
      <Avatar name="Priya K" size={80} />
      <Avatar size={40} />
      <Avatar name="Broken Image" src="https://invalid.local/x.png" size={40} />
    </Box>
  ),
};

export const Icons: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', maxWidth: 480 }}>
      {(
        [
          'bookmark',
          'bell',
          'search',
          'briefcase',
          'compass',
          'radar',
          'dashboard',
          'settings',
          'user',
          'check',
          'close',
          'externalLink',
          'clock',
          'star',
          'mapPin',
          'building',
          'filter',
          'offline',
        ] as const
      ).map((name) => (
        <Box key={name} sx={{ textAlign: 'center', width: 64 }}>
          <Icon name={name} size={18} />
          <Typography variant="textXs" color="secondary">
            {name}
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};

export const IconSizes: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {([14, 16, 18, 20, 24] as const).map((size) => (
        <Box key={size} sx={{ textAlign: 'center' }}>
          <Icon name="bookmark" size={size} />
          <Typography variant="textXs" color="secondary">
            {size}px
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};
