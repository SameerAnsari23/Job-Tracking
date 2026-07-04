import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, layout, duration, easing } from '@/theme';

export interface SplitPaneProps {
  /** Left rail (filter panel). Hidden entirely when undefined. */
  start?: ReactNode;
  startWidth?: number;
  /** Right inspection panel — slides in/out with endOpen (motion grammar). */
  end?: ReactNode;
  endWidth?: number;
  endOpen?: boolean;
  /** Accessible name for the end panel region. */
  endLabel?: string;
  /** Center content (the list). */
  children: ReactNode;
}

/**
 * The 3-pane workbench shell (Phase 16.4, job search): fixed start rail,
 * fluid center, sliding end panel (rightward slide = inspection). Page
 * owns breakpoint decisions — it simply omits start/end below lg. Each
 * pane is its own scroll container; the page body never scrolls sideways.
 */
export function SplitPane({
  start,
  startWidth = layout.filterPanelWidth,
  end,
  endWidth = layout.detailPanelWidth,
  endOpen = false,
  endLabel = 'Details',
  children,
}: SplitPaneProps) {
  const theme = useTheme();
  const n = theme.palette.mode === 'dark' ? neutralDark : neutralLight;

  return (
    <Box sx={{ display: 'flex', minHeight: 0, height: '100%', overflow: 'hidden' }}>
      {start && (
        <Box
          data-slot="start"
          sx={{
            width: startWidth,
            flexShrink: 0,
            borderRight: `1px solid ${n[200]}`,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {start}
        </Box>
      )}

      <Box data-slot="center" sx={{ flex: 1, minWidth: 0, overflowY: 'auto', minHeight: 0 }}>
        {children}
      </Box>

      {end && (
        <Box
          component="aside"
          role="complementary"
          aria-label={endLabel}
          aria-hidden={!endOpen}
          data-slot="end"
          data-state={endOpen ? 'open' : 'closed'}
          sx={{
            width: endOpen ? endWidth : 0,
            flexShrink: 0,
            overflow: 'hidden',
            borderLeft: endOpen ? `1px solid ${n[200]}` : 'none',
            transition: `width ${duration.slow}ms ${easing.standard}`,
          }}
        >
          <Box sx={{ width: endWidth, height: '100%', overflowY: 'auto' }}>{end}</Box>
        </Box>
      )}
    </Box>
  );
}
