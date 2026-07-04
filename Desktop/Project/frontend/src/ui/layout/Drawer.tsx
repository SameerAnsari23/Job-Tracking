import { useId } from 'react';
import type { ReactNode } from 'react';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { radius, layout } from '@/theme';
import { Typography } from '../foundation/Typography';
import { Icon } from '../foundation/Icon';
import { Divider } from '../foundation/Divider';
import { Stack } from './Stack';

export type DrawerSide = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** right = detail/notifications · left = mobile nav · bottom = sheet. */
  side?: DrawerSide;
  /** Panel width (left/right) in px; bottom sheets size to content. */
  width?: number;
  title: string;
  /** Pinned footer row ("View all notifications →"). */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Edge panel (Phase 16.4): slide per the motion grammar, focus trap +
 * return-to-trigger, Esc/scrim close, scroll lock — via MUI Modal.
 * Bottom sheets get radius-2xl top corners (Phase 16.2). Swipe-to-close is
 * intentionally NOT implemented — visible controls only (swipe-safety rule:
 * every gesture has a button equivalent, so we ship the buttons).
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  width = layout.drawerWidth,
  title,
  footer,
  children,
}: DrawerProps) {
  const titleId = useId();

  return (
    <MuiDrawer
      open={open}
      onClose={onClose}
      anchor={side}
      PaperProps={{
        // MUI Drawer paper is a plain div — Dialog semantics added here.
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        sx: {
          ...(side === 'bottom'
            ? {
                borderRadius: `${radius.xxl}px ${radius.xxl}px 0 0`,
                maxHeight: '85dvh',
              }
            : { width, maxWidth: '100vw' }),
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      data-variant={side}
    >
      <Box sx={{ px: 5, py: 4, flexShrink: 0 }}>
        <Stack direction="row" align="center" justify="between" gap={4}>
          <Typography variant="h5" id={titleId} as="h2">
            {title}
          </Typography>
          <IconButton aria-label={`Close ${title}`} onClick={onClose} size="small">
            <Icon name="close" size={18} />
          </IconButton>
        </Stack>
      </Box>
      <Divider />
      {/* The scroll container — header and footer stay pinned. */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 5, py: 4, minHeight: 0 }}>{children}</Box>
      {footer && (
        <>
          <Divider />
          <Box sx={{ px: 5, py: 4, flexShrink: 0 }}>{footer}</Box>
        </>
      )}
    </MuiDrawer>
  );
}
