import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { topNav, layout, zIndexTokens } from '@/theme';

export interface TopNavigationProps {
  /** Hamburger/breadcrumb area, left-aligned. */
  start?: ReactNode;
  /** Search trigger/input — center-left after the spacer. */
  search?: ReactNode;
  /** Extra actions before the notification bell. */
  actions?: ReactNode;
  notifications?: ReactNode;
  profile?: ReactNode;
}

/**
 * 64px sticky header (Phase 16.2): frosted-glass background, all content
 * injected via slots — TopNavigation owns no business logic, only the
 * frame and the left→right order (start, search, spacer, actions,
 * notifications, profile).
 */
export function TopNavigation({
  start,
  search,
  actions,
  notifications,
  profile,
}: TopNavigationProps) {
  const theme = useTheme();
  const bg = theme.palette.mode === 'dark' ? topNav.bgDark : topNav.bgLight;

  return (
    <Box
      component="header"
      sx={{
        height: layout.topNavHeight,
        position: 'sticky',
        top: 0,
        zIndex: zIndexTokens.sticky,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        px: 8,
        backgroundColor: bg,
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {start}
      {search}
      <Box sx={{ flex: 1 }} />
      {actions}
      {notifications}
      {profile}
    </Box>
  );
}
