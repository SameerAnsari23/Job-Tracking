import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import { sidebar, layout, gradients, duration, easing } from '@/theme';
import { SidebarContext } from './SidebarContext';

export interface SidebarProps {
  collapsed: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  /** Accessible name for the nav landmark. */
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * The always-dark navigation spine (Phase 16.2/16.3 signature — dark in
 * BOTH themes). Width animates between expanded/collapsed; the internal
 * scroll region gets a bottom fade over overflow content.
 *
 * Keyboard: arrow-key convenience layered over the NORMAL tab order (every
 * item keeps tabIndex 0 and its own Tab stop) — deliberately NOT the strict
 * roving-tabindex pattern used by Tabs/BottomNavigation. A persistent nav
 * rail is browsed like a page, not operated like a single widget; Tab still
 * visits every link individually (important when jumping in in the middle
 * of the page), while ArrowUp/Down offer fast sequential movement on top.
 */
export function Sidebar({
  collapsed,
  header,
  footer,
  'aria-label': ariaLabel = 'Main',
  children,
}: SidebarProps) {
  const navRef = useRef<HTMLElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>('[data-sidebar-item]:not([data-disabled])') ??
        [],
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <Box
        component="nav"
        ref={navRef}
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        data-state={collapsed ? 'collapsed' : 'expanded'}
        sx={{
          width: collapsed ? layout.sidebarCollapsedWidth : layout.sidebarWidth,
          flexShrink: 0,
          height: '100%',
          backgroundColor: sidebar.bgLight,
          borderRight: `1px solid ${sidebar.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: `width ${duration.base}ms ${easing.standard}`,
        }}
      >
        {header && (
          <Box
            sx={{
              height: layout.topNavHeight,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              px: collapsed ? 0 : 5,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            {header}
          </Box>
        )}

        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 3, py: 2 }}>
            {children}
          </Box>
          {/* Bottom fade over overflow content (Phase 16.2). */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 32,
              background: gradients.sidebarFade,
              pointerEvents: 'none',
            }}
          />
        </Box>

        {footer && <Box sx={{ flexShrink: 0 }}>{footer}</Box>}
      </Box>
    </SidebarContext.Provider>
  );
}
