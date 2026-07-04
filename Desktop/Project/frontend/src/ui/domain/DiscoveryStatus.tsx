import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark } from '@/theme';
import { Typography } from '../foundation/Typography';
import { StatusDot } from './internal/StatusDot';

export type DiscoveryStatusState = 'active' | 'paused' | 'running' | 'backoff' | 'error';

export interface DiscoveryStatusProps {
  state: DiscoveryStatusState;
  /** e.g. "3 profiles monitoring 47 companies across 5 sources". */
  summary?: string;
  /** Activate/Deactivate button. */
  actionSlot?: ReactNode;
}

const STATE_LABEL: Record<DiscoveryStatusState, string> = {
  active: 'Active',
  paused: 'Paused',
  running: 'Running',
  backoff: 'Retrying',
  error: 'Error',
};

/**
 * The discovery status banner (Phase 16.3 §1.5): five states mapped onto
 * the semantic tone scale — active/running are "good", paused is neutral,
 * backoff is a transient warning, error needs attention. Only `running`
 * pulses (work happening right now); the others hold steady.
 */
export function DiscoveryStatus({ state, summary, actionSlot }: DiscoveryStatusProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;

  const dotColor: Record<DiscoveryStatusState, string> = {
    active: s.successText,
    running: theme.palette.primary.main,
    paused: theme.palette.text.disabled,
    backoff: s.warningText,
    error: s.errorText,
  };

  return (
    <Box
      data-state={state}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <StatusDot
          color={dotColor[state]}
          pulse={state === 'running'}
          srLabel={`Discovery: ${STATE_LABEL[state]}`}
        />
        <Box>
          <Typography variant="h6" as="span">
            {STATE_LABEL[state]}
          </Typography>
          {summary && (
            <Typography variant="textSm" color="secondary">
              {summary}
            </Typography>
          )}
        </Box>
      </Box>
      {actionSlot}
    </Box>
  );
}
