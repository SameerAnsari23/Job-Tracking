import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark } from '@/theme';
import { Typography } from '../foundation/Typography';
import { StatusDot } from './internal/StatusDot';

export type HealthState = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthIndicatorProps {
  state: HealthState;
  /** e.g. "MongoDB". */
  label?: string;
  /** Preformatted timestamp — no date computation here. */
  lastChecked?: string;
  /** Pulses for tiles that poll live (Phase 16.3 admin auto-refresh indicator). */
  pulse?: boolean;
}

const STATE_LABEL: Record<HealthState, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  unhealthy: 'Down',
  unknown: 'Unknown',
};

/**
 * The admin dot vocabulary (Phase 16.3 §1.9): healthy/degraded/unhealthy/
 * unknown mapped onto the semantic tone scale, with the state name always
 * present as text alongside the dot — color never carries meaning alone.
 */
export function HealthIndicator({
  state,
  label,
  lastChecked,
  pulse = false,
}: HealthIndicatorProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;

  const dotColor: Record<HealthState, string> = {
    healthy: s.successText,
    degraded: s.warningText,
    unhealthy: s.errorText,
    unknown: theme.palette.text.disabled,
  };

  return (
    <Box data-state={state} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <StatusDot
        color={dotColor[state]}
        pulse={pulse}
        srLabel={`${label ?? 'Status'}: ${STATE_LABEL[state]}`}
      />
      <Box>
        {label && (
          <Typography variant="textSm" as="span">
            {label}
          </Typography>
        )}
        <Typography variant="textXs" color="secondary" as="span">
          {' '}
          {STATE_LABEL[state]}
          {lastChecked ? ` · ${lastChecked}` : ''}
        </Typography>
      </Box>
    </Box>
  );
}
