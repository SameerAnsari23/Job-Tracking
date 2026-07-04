import { useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import MuiPopover from '@mui/material/Popover';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, shadowsLight, shadowsDark, radius } from '@/theme';

export type PopoverPlacement = 'bottom-start' | 'bottom-end' | 'bottom' | 'top' | 'right';

export interface PopoverProps {
  /** The anchor element — receives open handlers per `openOn`. */
  trigger: ReactElement;
  openOn?: 'click' | 'hover';
  /** Hover intent delay (Phase 16.3 company preview: 500ms). */
  hoverDelayMs?: number;
  placement?: PopoverPlacement;
  children: ReactNode;
}

const ORIGINS: Record<
  PopoverPlacement,
  {
    anchorOrigin: {
      vertical: 'top' | 'bottom' | 'center';
      horizontal: 'left' | 'right' | 'center';
    };
    transformOrigin: {
      vertical: 'top' | 'bottom' | 'center';
      horizontal: 'left' | 'right' | 'center';
    };
  }
> = {
  'bottom-start': {
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  },
  'bottom-end': {
    anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
    transformOrigin: { vertical: 'top', horizontal: 'right' },
  },
  bottom: {
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
  },
  top: {
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    transformOrigin: { vertical: 'bottom', horizontal: 'center' },
  },
  right: {
    anchorOrigin: { vertical: 'center', horizontal: 'right' },
    transformOrigin: { vertical: 'center', horizontal: 'left' },
  },
};

const POPPER_PLACEMENT: Record<
  PopoverPlacement,
  'bottom-start' | 'bottom-end' | 'bottom' | 'top' | 'right'
> = {
  'bottom-start': 'bottom-start',
  'bottom-end': 'bottom-end',
  bottom: 'bottom',
  top: 'top',
  right: 'right',
};

/**
 * Anchored floating panel (Phase 16.4): non-blocking content like the
 * company preview and the skill-add form.
 *
 * Click mode: MUI Popover (modal — Esc/scrim close, focus managed).
 * Hover mode: MUI Popper (NON-modal — a Modal would aria-hide the rest of
 * the page including the trigger itself, breaking screen readers). Opens
 * after an intent delay, also on keyboard focus, closes on leave/blur.
 */
export function Popover({
  trigger,
  openOn = 'click',
  hoverDelayMs = 500,
  placement = 'bottom-start',
  children,
}: PopoverProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const sh = dark ? shadowsDark : shadowsLight;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = Boolean(anchorEl);

  const clearTimer = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const triggerProps =
    openOn === 'click'
      ? {
          onClick: (e: React.MouseEvent<HTMLElement>) => setAnchorEl(open ? null : e.currentTarget),
          'aria-expanded': open,
          'aria-haspopup': 'dialog' as const,
        }
      : {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            clearTimer();
            const target = e.currentTarget;
            hoverTimer.current = setTimeout(() => setAnchorEl(target), hoverDelayMs);
          },
          onMouseLeave: () => {
            clearTimer();
            setAnchorEl(null);
          },
          onFocus: (e: React.FocusEvent<HTMLElement>) => setAnchorEl(e.currentTarget),
          onBlur: () => setAnchorEl(null),
        };

  return (
    <>
      <Box component="span" sx={{ display: 'inline-flex' }} {...triggerProps}>
        {trigger}
      </Box>
      {openOn === 'click' ? (
        <MuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          {...ORIGINS[placement]}
          slotProps={{ paper: { sx: { p: 4 } } }}
        >
          {children}
        </MuiPopover>
      ) : (
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={POPPER_PLACEMENT[placement]}
          sx={{ zIndex: theme.zIndex.tooltip }}
        >
          <Paper
            role="status"
            sx={{
              p: 4,
              mt: 1,
              borderRadius: `${radius.lg}px`,
              boxShadow: sh.md,
              border: `1px solid ${n[200]}`,
              backgroundImage: 'none',
            }}
          >
            {children}
          </Paper>
        </Popper>
      )}
    </>
  );
}
