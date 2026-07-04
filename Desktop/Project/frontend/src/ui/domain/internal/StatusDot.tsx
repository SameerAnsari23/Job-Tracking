import Box from '@mui/material/Box';

export interface StatusDotProps {
  color: string;
  pulse?: boolean;
  srLabel: string;
}

/**
 * The colored status dot shared by DiscoveryStatus, QueueStatus, and
 * HealthIndicator — one implementation of the pulse animation and the
 * accompanying screen-reader text, rather than three copies of it.
 * Pulse respects prefers-reduced-motion via the theme's global CSS rule
 * (animation-duration collapses to 0.01ms).
 */
export function StatusDot({ color, pulse = false, srLabel }: StatusDotProps) {
  return (
    <Box
      role="status"
      aria-label={srLabel}
      sx={{
        position: 'relative',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        ...(pulse && {
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            backgroundColor: color,
            animation: 'status-dot-pulse 2s ease-out infinite',
          },
          '@keyframes status-dot-pulse': {
            '0%': { transform: 'scale(1)', opacity: 0.6 },
            '100%': { transform: 'scale(2.2)', opacity: 0 },
          },
        }),
      }}
    />
  );
}
