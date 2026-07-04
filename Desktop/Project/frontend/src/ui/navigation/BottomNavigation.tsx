import type { ElementType } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { layout, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Badge } from '../foundation/Badge';
import { warnDev } from '../internal/dev';
import { useRovingTabIndex } from './internal/useRovingTabIndex';

export interface BottomNavItem {
  value: string;
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  activeValue: string;
  routerComponent?: ElementType;
}

const MAX_ITEMS = 5;

/**
 * Mobile-only tab bar (Phase 16.2/16.4): true roving-tabindex tablist —
 * a small, fixed-size, single-purpose widget, unlike Sidebar's persistent
 * multi-destination rail, so the strict ARIA pattern (one Tab stop, arrow
 * keys move focus) fits here. Shares useRovingTabIndex with Tabs'
 * segmented variant rather than reimplementing the same keyboard logic.
 */
export function BottomNavigation({ items, activeValue, routerComponent }: BottomNavigationProps) {
  const theme = useTheme();

  warnDev(items.length > MAX_ITEMS, `[BottomNavigation] max ${MAX_ITEMS} items (Phase 16.2).`);

  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.value === activeValue),
  );
  const roving = useRovingTabIndex(items.length, activeIndex);

  return (
    <Box
      component="nav"
      role="tablist"
      aria-label="Primary"
      onKeyDown={(e) => roving.onKeyDown(e, 'horizontal')}
      sx={{
        display: 'flex',
        height: layout.bottomNavHeight,
        paddingBottom: 'env(safe-area-inset-bottom)',
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      {items.map((item, index) => {
        const active = item.value === activeValue;
        const Component: ElementType = item.href ? (routerComponent ?? 'a') : 'button';

        return (
          <Box
            key={item.value}
            component={Component}
            href={item.href && !routerComponent ? item.href : undefined}
            to={item.href && routerComponent ? item.href : undefined}
            onClick={item.onClick}
            type={Component === 'button' ? 'button' : undefined}
            role="tab"
            aria-selected={active}
            tabIndex={roving.tabIndexFor(index)}
            ref={roving.registerItem(index)}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              border: 'none',
              background: 'none',
              textDecoration: 'none',
              cursor: 'pointer',
              color: active ? 'primary.main' : theme.palette.text.secondary,
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Icon name={item.icon} size={20} />
              {item.badge !== undefined && (
                <Box sx={{ position: 'absolute', top: -6, right: -10 }}>
                  <Badge tone="accent" srLabel={`${item.badge} unread`}>
                    {String(item.badge)}
                  </Badge>
                </Box>
              )}
            </Box>
            <Box component="span" sx={{ ...typeScale.textXs, fontWeight: active ? 600 : 400 }}>
              {item.label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
