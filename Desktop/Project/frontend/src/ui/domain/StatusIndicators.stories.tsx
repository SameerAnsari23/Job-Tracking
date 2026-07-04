import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { DiscoveryStatus } from './DiscoveryStatus';
import { QueueStatus } from './QueueStatus';
import { HealthIndicator } from './HealthIndicator';
import { Button } from '../foundation/Button';

const meta: Meta = { title: 'Domain/DiscoveryStatus · QueueStatus · HealthIndicator' };
export default meta;

export const DiscoveryStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 560 }}>
      <DiscoveryStatus
        state="active"
        summary="3 profiles monitoring 47 companies across 5 sources"
        actionSlot={<Button variant="ghost">Deactivate</Button>}
      />
      <DiscoveryStatus state="running" summary="Crawling greenhouse now…" />
      <DiscoveryStatus
        state="paused"
        summary="You won't receive new matches"
        actionSlot={<Button>Activate</Button>}
      />
      <DiscoveryStatus state="backoff" summary="Retrying after a transient error" />
      <DiscoveryStatus state="error" summary="Last crawl failed — check your watchlist" />
    </Box>
  ),
};

export const QueueStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
      <QueueStatus
        name="crawl-dispatch"
        state="idle"
        cadence="Every 15 min"
        retryPolicy="3 attempts"
        depth={0}
      />
      <QueueStatus name="crawl-execution" state="processing" cadence="Continuous" depth={12} />
      <QueueStatus name="crawl-planning" state="completed" cadence="Every 6h" depth={null} />
      <QueueStatus name="job-expire" state="failed" cadence="Every 1h" depth={undefined} />
    </Box>
  ),
};

export const HealthStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <HealthIndicator state="healthy" label="MongoDB" lastChecked="just now" pulse />
      <HealthIndicator state="degraded" label="Redis" lastChecked="30s ago" />
      <HealthIndicator state="unhealthy" label="API" lastChecked="2m ago" />
      <HealthIndicator state="unknown" label="Worker pool" />
    </Box>
  ),
};
