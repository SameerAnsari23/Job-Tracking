import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { Typography } from './Typography';
import { typeScale } from '@/theme';

const meta = {
  title: 'Foundation/Typography',
  component: Typography,
} satisfies Meta<typeof Typography>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'textBase', color: 'primary', children: 'Software Engineer at Stripe' },
};

export const AllVariants: Story = {
  args: { children: '' },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 680 }}>
      {(Object.keys(typeScale) as Array<keyof typeof typeScale>).map((v) => (
        <Typography key={v} variant={v}>
          {v} — Backend Engineer, Platform at Notion
        </Typography>
      ))}
    </Box>
  ),
};

export const Colors: Story = {
  args: { children: '' },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {(['primary', 'secondary', 'disabled', 'accent', 'success', 'warning', 'error'] as const).map(
        (c) => (
          <Typography key={c} color={c}>
            {c} — 142 open roles at Vercel
          </Typography>
        ),
      )}
    </Box>
  ),
};

export const ContentExtremes: Story = {
  args: { children: '' },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 280 }}>
      <Typography variant="textMd" truncate={1}>
        Senior Staff Software Engineer, Infrastructure & Developer Productivity Platform
      </Typography>
      <Typography variant="textSm" truncate={2}>
        Truncated to two lines: we are looking for an engineer to join the team building the core
        payments infrastructure that powers millions of businesses worldwide across every market.
      </Typography>
      <Typography variant="textSm" tabularNums>
        Tabular: $180,000–$220,000 · 142 jobs · 07:45
      </Typography>
      <Typography variant="textSm" mono>
        mono: greenhouse · 3f8a-22c1
      </Typography>
    </Box>
  ),
};
