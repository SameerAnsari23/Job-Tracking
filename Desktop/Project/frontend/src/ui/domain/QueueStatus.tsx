import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark } from '@/theme';
import { Badge } from '../foundation/Badge';
import { Typography } from '../foundation/Typography';
import { StatusDot } from './internal/StatusDot';

export type QueueState = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export interface QueueStatusProps {
  /** Mono queue name, e.g. "crawl-dispatch". */
  name: string;
  state: QueueState;
  cadence?: string;
  retryPolicy?: string;
  /** Live depth — omit (or null) to render the honesty-rule UNAVAILABLE badge instead of a fabricated number. */
  depth?: number | null;
}

const STATE_LABEL: Record<QueueState, string> = {
  idle: 'Idle',
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

/**
 * Admin queue tile (Phase 16.4): status dot + config facts. When live
 * depth isn't available, this renders an explicit UNAVAILABLE badge
 * rather than a zero or a dash — an admin screen that fabricates numbers
 * is worse than one that admits it doesn't know.
 */
export function QueueStatus({ name, state, cadence, retryPolicy, depth }: QueueStatusProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;

  const dotColor: Record<QueueState, string> = {
    idle: theme.palette.text.disabled,
    queued: theme.palette.text.disabled,
    processing: theme.palette.primary.main,
    completed: s.successText,
    failed: s.errorText,
  };

  return (
    <Box data-state={state} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        <Typography variant="textSm" mono as="span">
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <StatusDot
            color={dotColor[state]}
            pulse={state === 'processing'}
            srLabel={`Queue ${name}: ${STATE_LABEL[state]}`}
          />
          <Typography variant="textXs" color="secondary" as="span">
            {STATE_LABEL[state]}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {cadence && (
          <Typography variant="textXs" color="secondary">
            {cadence}
          </Typography>
        )}
        {retryPolicy && (
          <Typography variant="textXs" color="secondary" mono>
            {retryPolicy}
          </Typography>
        )}
        {depth == null ? (
          <Badge tone="neutral">UNAVAILABLE</Badge>
        ) : (
          <Typography variant="textXs" color="secondary" tabularNums>
            {depth} in queue
          </Typography>
        )}
      </Box>
    </Box>
  );
}
