import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Surface } from '../foundation/Surface';
import { Typography } from '../foundation/Typography';
import { Spinner } from '../foundation/Spinner';
import { ErrorState } from '../layout/ErrorState';
import { EmptyState } from '../layout/EmptyState';

export interface ChartLegendItem {
  label: string;
  color: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  legend?: ChartLegendItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Shown instead of children when there isn't enough data — never fabricate a flat line. */
  empty?: boolean;
  emptyMessage?: string;
  footer?: ReactNode;
  /** Chart height — the caller's rendering fills this box responsively. */
  height?: number;
  /** The actual chart. Rendering it is explicitly out of scope for this component. */
  children?: ReactNode;
}

/**
 * Presentation-only chart frame (Phase 16.4) — title/subtitle/toolbar
 * header, legend row, loading/error/empty precedence, footer, and a
 * height-bound content area the caller fills with an actual chart once a
 * charting library is wired (a later phase). No data aggregation, no
 * chart-library dependency here.
 *
 * Not built on ui/layout's Widget: Widget's title is the dashboard
 * micro-label treatment (label-xs uppercase); a chart card needs a real
 * heading (h6) plus an optional subtitle, which is different enough
 * visual weight that composing Widget would fight its own styling rather
 * than reuse it cleanly.
 */
export function ChartCard({
  title,
  subtitle,
  toolbar,
  legend,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyMessage = 'Not enough data yet — check back after your first week.',
  footer,
  height = 240,
  children,
}: ChartCardProps) {
  return (
    <Surface level="raised" padding={6}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="textSm" color="secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {toolbar}
        </Box>

        {legend && legend.length > 0 && (
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {legend.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  aria-hidden
                  sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }}
                />
                <Typography variant="textXs" color="secondary">
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <Spinner size={20} label={`Loading ${title}`} />
          ) : error ? (
            <ErrorState compact title={error} onRetry={onRetry} />
          ) : empty ? (
            <EmptyState icon="gauge" title={emptyMessage} />
          ) : (
            <Box sx={{ width: '100%', height: '100%' }}>{children}</Box>
          )}
        </Box>

        {footer && !loading && !error && <Box>{footer}</Box>}
      </Box>
    </Surface>
  );
}
