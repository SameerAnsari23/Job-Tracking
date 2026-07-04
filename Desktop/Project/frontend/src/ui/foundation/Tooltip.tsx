import type { ReactElement } from 'react';
import MuiTooltip from '@mui/material/Tooltip';

export interface TooltipProps {
  /**
   * Text only (Phase 16.4 rule): tooltips never contain interactive
   * elements and are never the sole carrier of essential information.
   */
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Hover delay — 500ms product default. */
  delay?: number;
  /** Must accept a ref (all foundation components do). */
  children: ReactElement;
}

/**
 * Theme-styled MUI Tooltip: shows on hover AND keyboard focus, dismisses on
 * Escape, suppressed on touch (essential info must exist elsewhere —
 * Phase 16.4). Visual styling lives in the theme layer.
 */
export function Tooltip({ content, placement = 'top', delay = 500, children }: TooltipProps) {
  return (
    <MuiTooltip
      title={content}
      placement={placement}
      enterDelay={delay}
      enterTouchDelay={999999}
      leaveTouchDelay={0}
      arrow
    >
      {children}
    </MuiTooltip>
  );
}
