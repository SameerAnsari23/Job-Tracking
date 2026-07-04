import { useState } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '../foundation/Typography';
import { Icon } from '../foundation/Icon';
import { Button } from '../foundation/Button';
import { Stack } from './Stack';

export interface ErrorStateProps {
  title?: string;
  /** Known cause, when it helps ("You appear to be offline"). */
  cause?: string;
  /** May return a promise — the retry button locks while it settles. */
  onRetry?: () => void | Promise<void>;
  /** Row form for Widget-inline failures. */
  compact?: boolean;
}

/**
 * Section-tier failure (Phase 16.3 §3.5): what broke, why if known, and a
 * retry that only re-runs the failed operation. Full and compact forms.
 */
export function ErrorState({
  title = "Couldn't load this content",
  cause,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (compact) {
    return (
      <Stack direction="row" gap={3} align="center" data-variant="compact">
        <Box sx={{ color: 'error.main', display: 'inline-flex' }}>
          <Icon name="alert" size={16} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="textSm">{title}</Typography>
        </Box>
        {onRetry && (
          <Button variant="ghost" size="sm" loading={retrying} onClick={retry}>
            Try again
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={4} align="center">
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Box sx={{ color: 'error.main', display: 'inline-flex' }}>
          <Icon name="alert" size={24} />
        </Box>
        <Stack gap={2} align="center">
          <Typography variant="h5" as="p">
            {title}
          </Typography>
          {cause && (
            <Typography variant="textSm" color="secondary">
              {cause}
            </Typography>
          )}
        </Stack>
        {onRetry && (
          <Button variant="secondary" loading={retrying} onClick={retry}>
            Try again
          </Button>
        )}
      </Box>
    </Stack>
  );
}
