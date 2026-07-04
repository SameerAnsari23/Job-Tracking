import { useId } from 'react';
import type { ReactNode } from 'react';
import MuiDialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { radius } from '@/theme';
import { Typography } from '../foundation/Typography';
import { Stack } from './Stack';

export type DialogSize = 'sm' | 'lg';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** sm 480 (confirmations) · lg 640 (multi-field forms) — Phase 16.2. */
  size?: DialogSize;
  title: string;
  description?: string;
  /** Right-aligned action row; destructive action leftmost when present. */
  actions?: ReactNode;
  /**
   * Esc + scrim dismissal. Turn OFF for wizards mid-flight — closing then
   * requires an explicit action (discard confirm).
   */
  dismissible?: boolean;
  children?: ReactNode;
}

const WIDTH: Record<DialogSize, number> = { sm: 480, lg: 640 };

/**
 * Modal dialog (Phase 16.4): focus trap, scroll lock, aria-modal and
 * labelledby/describedby wiring, scale-in animation, nested-dialog stacking
 * — all via the MUI Modal machinery; visuals from the theme layer.
 * Below the sm breakpoint it becomes a bottom sheet (radius-2xl top,
 * full-width, rises from the bottom) per the responsive spec.
 */
export function Dialog({
  open,
  onClose,
  size = 'sm',
  title,
  description,
  actions,
  dismissible = true,
  children,
}: DialogProps) {
  const theme = useTheme();
  const sheet = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();
  const descriptionId = useId();

  return (
    <MuiDialog
      open={open}
      onClose={(_, reason) => {
        if (!dismissible && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      disableEscapeKeyDown={!dismissible}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: sheet ? '100%' : WIDTH[size],
          maxWidth: sheet ? '100%' : `calc(100% - ${theme.spacing(8)})`,
          m: sheet ? 0 : 8,
          ...(sheet && {
            position: 'fixed',
            bottom: 0,
            borderRadius: `${radius.xxl}px ${radius.xxl}px 0 0`,
          }),
        },
      }}
      data-variant={size}
    >
      <Box sx={{ p: 6 }}>
        <Stack gap={5}>
          <Stack gap={1}>
            <Typography variant="h5" id={titleId} as="h2">
              {title}
            </Typography>
            {description && (
              <Typography variant="textSm" color="secondary" id={descriptionId}>
                {description}
              </Typography>
            )}
          </Stack>
          {children}
          {actions && (
            <Stack direction="row" justify="end" gap={3}>
              {actions}
            </Stack>
          )}
        </Stack>
      </Box>
    </MuiDialog>
  );
}
