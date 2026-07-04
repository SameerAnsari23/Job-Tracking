import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark, duration, easing } from '@/theme';

export interface ProgressProps {
  /** 0–100. */
  value: number;
  variant?: 'bar' | 'ring';
  tone?: 'accent' | 'success';
  /** Bar height / ring diameter in px. */
  size?: number;
  /** Animate from 0 to value on mount (800ms — profile completion pattern). */
  animateOnMount?: boolean;
  /** Accessible name — required; progress never renders unnamed. */
  'aria-label': string;
}

/**
 * Determinate progress (Phase 16.4). Track neutral-200, radius-full, fill
 * accent (or success at completion) — all from the theme layer. Full
 * progressbar ARIA. animateOnMount jumps instantly under reduced motion
 * (the CSS transition collapses globally).
 */
export function Progress({
  value,
  variant = 'bar',
  tone = 'accent',
  size,
  animateOnMount = false,
  'aria-label': ariaLabel,
}: ProgressProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;
  const clamped = Math.max(0, Math.min(100, value));

  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : clamped);

  useEffect(() => {
    if (!animateOnMount) {
      setDisplayValue(clamped);
      return;
    }
    const frame = requestAnimationFrame(() => setDisplayValue(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped, animateOnMount]);

  const fillColor = tone === 'success' ? s.successText : theme.palette.primary.main;

  if (variant === 'ring') {
    return (
      <CircularProgress
        variant="determinate"
        value={displayValue}
        size={size ?? 32}
        thickness={4}
        aria-label={ariaLabel}
        sx={{ color: fillColor }}
      />
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={displayValue}
        aria-label={ariaLabel}
        sx={{
          ...(size ? { height: size } : {}),
          '& .MuiLinearProgress-bar': {
            backgroundColor: fillColor,
            transition: animateOnMount
              ? `transform 800ms ${easing.standard}`
              : `transform ${duration.base}ms ${easing.standard}`,
          },
        }}
      />
    </Box>
  );
}
