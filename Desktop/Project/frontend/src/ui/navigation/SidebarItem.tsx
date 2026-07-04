import { forwardRef } from 'react';
import type { ElementType, MouseEventHandler } from 'react';
import Box from '@mui/material/Box';
import { sidebar, duration, easing, radius } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Tooltip } from '../foundation/Tooltip';
import { Badge } from '../foundation/Badge';
import { useSidebarContext } from './SidebarContext';

export interface SidebarItemProps {
  icon: IconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Unread-style count shown as a small pill (e.g. Notifications). */
  badge?: number;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Router adapter, mirrors foundation Link (ui/ stays router-agnostic). */
  routerComponent?: ElementType;
}

/**
 * A single nav destination on the dark rail (Phase 16.2 states table).
 * `data-sidebar-item` marks it for the Sidebar root's arrow-key handler.
 * Collapsed mode: label clips to width 0 and a Tooltip carries the name.
 */
export const SidebarItem = forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  { icon, label, active = false, disabled = false, badge, href, onClick, routerComponent },
  ref,
) {
  const { collapsed } = useSidebarContext();

  const component: ElementType = href ? (routerComponent ?? 'a') : 'button';

  const content = (
    <Box
      ref={ref}
      component={component}
      href={!routerComponent || component === 'a' ? href : undefined}
      to={routerComponent && component !== 'a' ? href : undefined}
      onClick={disabled ? undefined : onClick}
      type={component === 'button' ? 'button' : undefined}
      // aria-disabled, never the native `disabled` attribute: a natively
      // disabled button fires no hover/focus events, which breaks the
      // collapsed-mode Tooltip (MUI warns about exactly this). The click
      // handler above is gated instead, so the item stays inert.
      aria-disabled={disabled || undefined}
      aria-current={active ? 'page' : undefined}
      data-sidebar-item=""
      data-disabled={disabled || undefined}
      data-state={active ? 'active' : 'inactive'}
      tabIndex={disabled ? -1 : 0}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: 36,
        px: 3,
        borderRadius: `${radius.md}px`,
        textDecoration: 'none',
        border: 'none',
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: active ? sidebar.itemActive : 'transparent',
        color: active ? sidebar.textActive : sidebar.textRest,
        opacity: disabled ? 0.4 : 1,
        transition: `background-color ${duration.fast}ms ${easing.easeOut}, color ${duration.fast}ms ${easing.easeOut}`,
        '&:hover': disabled
          ? undefined
          : {
              backgroundColor: active ? sidebar.itemActive : sidebar.itemHover,
              color: sidebar.textHover,
            },
        '&:focus-visible': { outline: `2px solid ${sidebar.focusRing}`, outlineOffset: '2px' },
      }}
    >
      {/* Active accent bar — grows from 0 height, per the motion grammar. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          width: 3,
          height: active ? 16 : 0,
          transform: 'translateY(-50%)',
          backgroundColor: sidebar.activeBar,
          borderRadius: `0 ${radius.sm}px ${radius.sm}px 0`,
          transition: `height ${duration.fast}ms ${easing.easeOut}`,
        }}
      />
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          color: active ? sidebar.iconActive : sidebar.iconRest,
        }}
      >
        <Icon name={icon} size={18} />
      </Box>
      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontSize: 14,
          textAlign: 'left',
          opacity: collapsed ? 0 : 1,
          transition: `opacity ${duration.fast}ms ${easing.easeOut} ${collapsed ? 0 : duration.base}ms`,
        }}
      >
        {label}
      </Box>
      {badge !== undefined && !collapsed && (
        <Badge tone="accent" srLabel={`${badge} unread`}>
          {String(badge)}
        </Badge>
      )}
    </Box>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
});
