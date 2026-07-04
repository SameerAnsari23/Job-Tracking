import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export type SpinnerSize = 14 | 16 | 20 | 32;

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Screen-reader text — spinners never appear without a name. */
  label?: string;
  /**
   * Appearance delay (Phase 16.3 §3.4: indicators only after 150ms so fast
   * responses never flash). Pass 0 for embedded use (e.g. Button loading,
   * where the button itself already communicates the state).
   */
  delayMs?: number;
}

/**
 * Indeterminate only — determinate progress is the Progress component.
 * Rotation collapses under prefers-reduced-motion via the global CSS rule;
 * the visible arc plus the SR label keeps state legible without motion.
 */
export function Spinner({ size = 20, label = 'Loading', delayMs = 150 }: SpinnerProps) {
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) return;
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <Box
      component="span"
      role="status"
      aria-label={label}
      sx={{ display: 'inline-flex', lineHeight: 0 }}
    >
      {visible && <CircularProgress size={size} thickness={4} aria-hidden />}
    </Box>
  );
}
