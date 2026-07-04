import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Surface } from '../foundation/Surface';
import { Typography } from '../foundation/Typography';
import { Stack } from './Stack';
import { LoadingState } from './LoadingState';
import type { LoadingLayout } from './LoadingState';
import { ErrorState } from './ErrorState';

export interface WidgetProps {
  /** label-xs uppercase widget heading (Phase 16.2 dashboard spec). */
  title: string;
  /** Right-aligned header action ("View all →"). */
  action?: ReactNode;
  /** Built-in state machine: loading → error → empty → content (16.4). */
  loading?: boolean;
  /** Custom skeleton matching the widget's real geometry. */
  skeleton?: ReactNode;
  skeletonLayout?: LoadingLayout;
  error?: string | null;
  onRetry?: () => void | Promise<void>;
  /** Rendered when not loading, no error, and `empty` is true. */
  empty?: boolean;
  emptyState?: ReactNode;
  children: ReactNode;
}

/**
 * Dashboard unit: raised Surface + uniform loading/error/empty handling so
 * every widget on the dashboard behaves identically for free (Phase 16.4).
 * State precedence: loading > error > empty > content.
 */
export function Widget({
  title,
  action,
  loading = false,
  skeleton,
  skeletonLayout = 'list',
  error = null,
  onRetry,
  empty = false,
  emptyState,
  children,
}: WidgetProps) {
  const body = loading ? (
    (skeleton ?? <LoadingState layout={skeletonLayout} count={3} label={`Loading ${title}`} />)
  ) : error ? (
    <ErrorState compact title={error} onRetry={onRetry} />
  ) : empty ? (
    (emptyState ?? (
      <Typography variant="textSm" color="secondary">
        Nothing here yet.
      </Typography>
    ))
  ) : (
    children
  );

  return (
    <Surface level="raised" padding={6} as="section">
      <Stack gap={4}>
        <Stack direction="row" align="center" justify="between" gap={4}>
          <Typography variant="labelXs" color="secondary" as="h3">
            {title}
          </Typography>
          <Box sx={{ position: 'relative', zIndex: 1 }}>{action}</Box>
        </Stack>
        <Box data-state={loading ? 'loading' : error ? 'error' : empty ? 'empty' : 'ready'}>
          {body}
        </Box>
      </Stack>
    </Surface>
  );
}
