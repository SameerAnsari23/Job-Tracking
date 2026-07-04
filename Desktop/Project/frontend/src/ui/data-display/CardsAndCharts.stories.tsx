import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { StatisticCard } from './StatisticCard';
import { ChartCard } from './ChartCard';

const meta: Meta = { title: 'Data Display/StatisticCard · ChartCard' };
export default meta;

export const Statistics: StoryObj = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      <StatisticCard
        label="New matches"
        value={12}
        trend={{ direction: 'up', delta: '+4' }}
        icon="star"
        sparkline={[3, 5, 4, 8, 6, 9, 12]}
      />
      <StatisticCard
        label="Saved jobs"
        value={24}
        trend={{ direction: 'up', delta: '+3 this week' }}
        icon="bookmark"
      />
      <StatisticCard label="Unread" value={3} icon="bell" />
      <StatisticCard label="Loading" value={0} loading />
    </Box>
  ),
};

export const StatisticCardLink: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 240 }}>
      <StatisticCard label="Saved jobs" value={24} icon="bookmark" href="/jobs/saved" />
    </Box>
  ),
};

export const ChartCardStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      <ChartCard
        title="Matches over time"
        subtitle="Last 30 days"
        legend={[
          { label: 'Matches', color: '#5B5BD6' },
          { label: 'Applications', color: '#2DD4BF' },
        ]}
        footer={<Box sx={{ fontSize: 12, color: 'text.secondary' }}>Updated 2 hours ago</Box>}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            fontSize: 12,
          }}
        >
          [ chart renders here ]
        </Box>
      </ChartCard>
      <ChartCard title="Loading" loading />
      <ChartCard title="Error" error="Couldn't load chart data" onRetry={() => {}} />
      <ChartCard title="Not enough data" empty />
    </Box>
  ),
};
