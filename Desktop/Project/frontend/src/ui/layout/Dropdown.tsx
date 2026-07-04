import { cloneElement, useState } from 'react';
import type { ReactElement, MouseEvent } from 'react';
import { Menu } from './Menu';
import type { MenuItemSpec } from './Menu';

export interface DropdownProps {
  /**
   * The trigger element — receives onClick, aria-haspopup, aria-expanded.
   * Typically a Button or icon Button.
   */
  trigger: ReactElement<{
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    'aria-haspopup'?: string;
    'aria-expanded'?: boolean;
  }>;
  items: MenuItemSpec[];
  'aria-label'?: string;
}

/**
 * Trigger + Menu preset (Phase 16.4): exists so open-state and ARIA wiring
 * are never hand-rolled at call sites. For custom anchoring use Menu
 * directly.
 */
export function Dropdown({ trigger, items, 'aria-label': ariaLabel }: DropdownProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      {cloneElement(trigger, {
        onClick: (e: MouseEvent<HTMLElement>) => setAnchorEl(open ? null : e.currentTarget),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })}
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        items={items}
        aria-label={ariaLabel}
      />
    </>
  );
}
