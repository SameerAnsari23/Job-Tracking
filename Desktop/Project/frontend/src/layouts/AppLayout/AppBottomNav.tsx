import { Link as RouterLink, useLocation } from 'react-router-dom';
import { BottomNavigation } from '@/ui/navigation/BottomNavigation';
import { BOTTOM_NAV_ITEMS } from './navItems';

/** Mobile (xs) fixed tab bar — the 5 most-used destinations. */
export function AppBottomNav() {
  const location = useLocation();
  const active = BOTTOM_NAV_ITEMS.find((item) => item.path === location.pathname)?.path ?? '';

  return (
    <BottomNavigation
      activeValue={active}
      routerComponent={RouterLink}
      items={BOTTOM_NAV_ITEMS.map((item) => ({
        value: item.path,
        icon: item.icon,
        label: item.label,
        href: item.path,
      }))}
    />
  );
}
