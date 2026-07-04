import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { Metric } from './Metric';
import { KeyValue } from './KeyValue';

const meta: Meta = { title: 'Data Display/Metric · KeyValue' };
export default meta;

export const MetricLayouts: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
      <Metric
        label="Saved jobs"
        value={24}
        layout="stacked"
        icon="bookmark"
        trend={{ direction: 'up', delta: '+3 this week' }}
      />
      <Metric label="Open roles" value={142} unit="roles" layout="inline" icon="briefcase" />
      <Metric
        label="Match rate"
        value="86%"
        layout="compact"
        trend={{ direction: 'down', delta: '-2%' }}
      />
    </Box>
  ),
};

export const KeyValues: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <KeyValue
        layout="inline"
        pairs={[
          { key: 'Location', value: 'San Francisco, CA (US)' },
          { key: 'Workplace', value: 'Remote' },
          { key: 'Source', value: 'greenhouse', mono: true, copyable: true },
        ]}
        onCopy={() => {}}
      />
      <KeyValue
        layout="vertical"
        pairs={[{ key: 'Job ID', value: '3f8a-22c1-9e40', mono: true, copyable: true }]}
        onCopy={() => {}}
      />
    </Box>
  ),
};
