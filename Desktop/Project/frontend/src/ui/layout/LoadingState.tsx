import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Skeleton } from '../foundation/Skeleton';
import { Stack } from './Stack';

export type LoadingLayout = 'list' | 'grid' | 'detail' | 'form';

export interface LoadingStateProps {
  /** Preset skeleton arrangements; pass children for exact custom geometry. */
  layout?: LoadingLayout;
  /** Rows/cells for list and grid presets. */
  count?: number;
  /** Accessible loading announcement — one per region, not per bone. */
  label?: string;
  children?: ReactNode;
}

function ListRows({ count }: { count: number }) {
  return (
    <Stack gap={2}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} shape="rect" width="100%" height={88} />
      ))}
    </Stack>
  );
}

function GridCells({ count }: { count: number }) {
  return (
    <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} shape="rect" width="100%" height={120} />
      ))}
    </Box>
  );
}

function DetailBlock() {
  return (
    <Stack gap={6}>
      <Stack direction="row" gap={4} align="center">
        <Skeleton shape="circle" width={48} height={48} />
        <Stack gap={2}>
          <Skeleton shape="text" width={220} />
          <Skeleton shape="text" width={140} />
        </Stack>
      </Stack>
      <Skeleton shape="rect" width="100%" height={56} />
      <Skeleton shape="text" lines={6} />
    </Stack>
  );
}

function FormBlock({ count }: { count: number }) {
  return (
    <Stack gap={6}>
      {Array.from({ length: count }, (_, i) => (
        <Stack key={i} gap={2}>
          <Skeleton shape="text" width={120} />
          <Skeleton shape="rect" width="100%" height={40} />
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * Assembled skeleton region (Phase 16.4): preset geometries matching the
 * product's real layouts (88px list rows = JobCard height), announced once
 * via aria-busy + a named status region.
 */
export function LoadingState({
  layout = 'list',
  count = 3,
  label = 'Loading',
  children,
}: LoadingStateProps) {
  return (
    <Box aria-busy="true" role="status" aria-label={label} data-variant={layout}>
      {children ??
        {
          list: <ListRows count={count} />,
          grid: <GridCells count={count} />,
          detail: <DetailBlock />,
          form: <FormBlock count={count} />,
        }[layout]}
    </Box>
  );
}
