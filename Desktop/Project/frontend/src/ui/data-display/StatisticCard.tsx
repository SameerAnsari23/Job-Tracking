import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark } from '@/theme';
import { Card } from '../layout/Card';
import { Skeleton } from '../foundation/Skeleton';
import type { IconName } from '../foundation/Icon';
import { Metric } from './Metric';
import type { MetricTrend } from './Metric';
import { sparklinePath } from './internal/sparklinePath';

export interface StatisticCardProps {
  label: string;
  value: string | number;
  trend?: MetricTrend;
  icon?: IconName;
  /** Omitted entirely below 3 points — a two-point line lies about a trend. */
  sparkline?: number[];
  loading?: boolean;
  href?: string;
  action?: ReactNode;
}

/**
 * Dashboard KPI tile (Phase 16.2/16.3): built on ui/layout's Card
 * (interactive-link + hover-lift behavior reused, not reimplemented) with
 * Metric supplying the label/value/trend row. Sparkline rendering is
 * presentation-only point-to-path math — no aggregation happens here.
 */
export function StatisticCard({
  label,
  value,
  trend,
  icon,
  sparkline,
  loading = false,
  href,
  action,
}: StatisticCardProps) {
  const theme = useTheme();
  const a = theme.palette.mode === 'dark' ? accentDark : accent;
  const showSparkline = sparkline && sparkline.length >= 3;

  if (loading) {
    return (
      <Card level="raised">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton shape="text" width="50%" />
          <Skeleton shape="text" width="35%" height={32} />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      level="raised"
      interactive={Boolean(href)}
      href={href}
      aria-label={href ? label : undefined}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Metric label={label} value={value} icon={icon} trend={trend} layout="stacked" />
        {showSparkline && (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <svg
              width="100%"
              height="28"
              viewBox="0 0 100 28"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d={`${sparklinePath(sparkline, 100, 24)} L100,28 L0,28 Z`}
                fill={a[500]}
                opacity={0.1}
                stroke="none"
              />
              <path
                d={sparklinePath(sparkline, 100, 24)}
                fill="none"
                stroke={a[500]}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={100}
                cy={
                  24 -
                  ((sparkline[sparkline.length - 1]! - Math.min(...sparkline)) /
                    (Math.max(...sparkline) - Math.min(...sparkline) || 1)) *
                    24
                }
                r={2.5}
                fill={a[500]}
              />
            </svg>
          </Box>
        )}
        {action && <Box sx={{ position: 'relative', zIndex: 1 }}>{action}</Box>}
      </Box>
    </Card>
  );
}
