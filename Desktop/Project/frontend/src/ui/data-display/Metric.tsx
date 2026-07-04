import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export type MetricLayout = 'inline' | 'stacked' | 'compact';

export interface MetricTrend {
  direction: 'up' | 'down' | 'flat';
  /** Preformatted delta text, e.g. "+3" or "12%" — no computation here. */
  delta: string;
}

export interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: IconName;
  trend?: MetricTrend;
  layout?: MetricLayout;
}

/**
 * The inline stat atom (Phase 16.4): label + value(+unit), the building
 * block StatisticCard composes for its number row. Also usable standalone
 * for compact inline stats (e.g. admin table summaries).
 */
export function Metric({ label, value, unit, icon, trend, layout = 'stacked' }: MetricProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;

  const trendColor = trend
    ? trend.direction === 'up'
      ? s.successText
      : trend.direction === 'down'
        ? s.errorText
        : theme.palette.text.secondary
    : undefined;
  const trendIcon: IconName | undefined = trend
    ? trend.direction === 'up'
      ? 'arrowUp'
      : trend.direction === 'down'
        ? 'arrowDown'
        : undefined
    : undefined;

  const valueRow = (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      <Typography variant={layout === 'compact' ? 'h5' : 'h3'} tabularNums as="span">
        {value}
      </Typography>
      {unit && (
        <Typography variant="textSm" color="secondary" as="span">
          {unit}
        </Typography>
      )}
    </Box>
  );

  const trendRow = trend && (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trendColor }}>
      {trendIcon && <Icon name={trendIcon} size={14} />}
      <Typography variant="textSm" color="inherit" as="span" tabularNums>
        {trend.delta}
      </Typography>
    </Box>
  );

  if (layout === 'inline') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {icon && (
          <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
            <Icon name={icon} size={18} />
          </Box>
        )}
        <Typography variant="textSm" color="secondary" as="span">
          {label}
        </Typography>
        {valueRow}
        {trendRow}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="labelXs" color="secondary" as="span">
          {label}
        </Typography>
        {icon && (
          <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
            <Icon name={icon} size={18} />
          </Box>
        )}
      </Box>
      {valueRow}
      {trendRow}
    </Box>
  );
}
