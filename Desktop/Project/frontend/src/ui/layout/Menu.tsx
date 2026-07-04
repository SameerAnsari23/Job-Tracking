import MuiMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Divider } from '../foundation/Divider';
import { warnDev } from '../internal/dev';
import { Fragment } from 'react';

export interface MenuItemSpec {
  icon?: IconName;
  label: string;
  onSelect: () => void;
  /** error-text styling; must be the LAST item, max one (Phase 16.4). */
  destructive?: boolean;
  disabled?: boolean;
  /** Renders a divider ABOVE this item. */
  divider?: boolean;
}

export interface MenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  items: MenuItemSpec[];
  /** Names the menu for assistive tech. */
  'aria-label'?: string;
}

/**
 * Action list (Phase 16.4): role="menu" pattern with arrow/Home/End/
 * type-ahead from MUI; theme-styled panel; destructive item in error color,
 * enforced last. Selecting an item closes the menu.
 */
export function Menu({ open, anchorEl, onClose, items, 'aria-label': ariaLabel }: MenuProps) {
  const theme = useTheme();

  const destructiveIndex = items.findIndex((i) => i.destructive);
  warnDev(
    destructiveIndex >= 0 && destructiveIndex !== items.length - 1,
    '[Menu] the destructive item must be last (Phase 16.4).',
  );
  warnDev(
    items.filter((i) => i.destructive).length > 1,
    '[Menu] at most one destructive item per menu (Phase 16.4).',
  );

  return (
    <MuiMenu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      MenuListProps={{ 'aria-label': ariaLabel, dense: true }}
    >
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {item.divider && index > 0 && (
            <Box sx={{ my: 1 }}>
              <Divider />
            </Box>
          )}
          <MenuItem
            disabled={item.disabled}
            onClick={() => {
              onClose();
              item.onSelect();
            }}
            sx={item.destructive ? { color: theme.palette.error.main } : undefined}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              {item.icon && <Icon name={item.icon} size={16} />}
              {item.label}
            </Box>
          </MenuItem>
        </Fragment>
      ))}
    </MuiMenu>
  );
}
