import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Sidebar } from '@/ui/navigation/Sidebar';
import { SidebarGroup } from '@/ui/navigation/SidebarGroup';
import { SidebarItem } from '@/ui/navigation/SidebarItem';
import { SidebarFooter } from '@/ui/navigation/SidebarFooter';
import { SidebarCollapseButton } from '@/ui/navigation/SidebarCollapseButton';
import { Avatar } from '@/ui/foundation/Avatar';
import { Typography } from '@/ui/foundation/Typography';
import { useAuthStore } from '@/shared/stores/authStore';
import { NAV_GROUPS } from './navItems';

export interface AppSidebarProps {
  collapsed: boolean;
  /** Tablet width forces the icon-only rail — the toggle button hides, not just disables. */
  toggleable: boolean;
  onToggleCollapse: () => void;
}

/**
 * The persistent desktop/tablet navigation rail — a composition over the
 * ui/navigation Sidebar family, wired to the real route tree and auth
 * state. No business logic: active-state comes from the URL, the footer
 * shows only identity (name/avatar), never data.
 */
export function AppSidebar({ collapsed, toggleable, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.email ?? 'Account';

  return (
    <Sidebar
      collapsed={collapsed}
      header={
        <Typography variant="h6" color="inherit" as="span">
          {collapsed ? '◆' : '◆ JobNotify'}
        </Typography>
      }
      footer={
        <SidebarFooter>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar name={displayName} size={24} />
            {!collapsed && (
              <Typography variant="textSm" color="inherit" as="span" truncate={1}>
                {displayName}
              </Typography>
            )}
            {toggleable && (
              <Box sx={{ ml: 'auto' }}>
                <SidebarCollapseButton collapsed={collapsed} onToggle={onToggleCollapse} />
              </Box>
            )}
          </Box>
        </SidebarFooter>
      }
    >
      {NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              href={item.path}
              routerComponent={RouterLink}
              active={location.pathname === item.path}
            />
          ))}
        </SidebarGroup>
      ))}
    </Sidebar>
  );
}
