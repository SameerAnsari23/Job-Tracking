import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Tabs } from './Tabs';
import { Typography } from '../foundation/Typography';

const meta: Meta = { title: 'Navigation/Tabs' };
export default meta;

const ITEMS = [
  {
    value: 'overview',
    label: 'Overview',
    content: <Typography variant="textSm">Overview panel</Typography>,
  },
  {
    value: 'experience',
    label: 'Experience',
    icon: 'briefcase' as const,
    content: <Typography variant="textSm">Experience panel</Typography>,
  },
  {
    value: 'skills',
    label: 'Skills',
    count: 12,
    content: <Typography variant="textSm">Skills panel</Typography>,
  },
  { value: 'disabled', label: 'Disabled', disabled: true, content: <span /> },
];

export const Underline: StoryObj = {
  render: () => <Tabs aria-label="Profile sections" items={ITEMS} defaultValue="overview" />,
};

export const Segmented: StoryObj = {
  render: () => (
    <Tabs aria-label="Sort order" variant="segmented" items={ITEMS} defaultValue="overview" />
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('overview');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="textXs" color="secondary">
        Controlled — external value: {value}
      </Typography>
      <Tabs aria-label="Profile sections" items={ITEMS} value={value} onChange={setValue} />
    </Box>
  );
}

export const Controlled: StoryObj = { render: () => <ControlledDemo /> };

export const SegmentedKeyboardRoving: StoryObj = {
  render: () => (
    <Tabs aria-label="Sort order" variant="segmented" items={ITEMS} defaultValue="overview" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    overview.focus();
    await expect(overview).toHaveAttribute('tabindex', '0');
    await userEvent.keyboard('{ArrowRight}');
    const experience = canvas.getByRole('tab', { name: /Experience/ });
    await expect(experience).toHaveFocus();
    await expect(overview).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{Enter}');
  },
};

export const UnderlineLazyMounting: StoryObj = {
  render: () => <Tabs aria-label="Profile sections" items={ITEMS} defaultValue="overview" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Overview panel')).toBeInTheDocument();
    await expect(canvas.queryByText('Experience panel')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: /Experience/ }));
    await expect(canvas.getByText('Experience panel')).toBeInTheDocument();
  },
};
