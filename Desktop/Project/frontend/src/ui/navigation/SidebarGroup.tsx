import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { sidebar, duration, easing } from '@/theme';
import { useSidebarContext } from './SidebarContext';

export interface SidebarGroupProps {
  /** Section label ("WORKSPACE", "PERSONAL") — non-interactive. */
  label: string;
  children: ReactNode;
}

/**
 * Groups SidebarItems under a label-xs uppercase heading. The label hides
 * visually when collapsed (icon-only rail) but stays for screen readers —
 * collapsing the rail doesn't remove the grouping semantics.
 */
export function SidebarGroup({ label, children }: SidebarGroupProps) {
  const { collapsed } = useSidebarContext();

  return (
    <Box component="section" aria-label={label} sx={{ mb: 4 }}>
      <Box
        aria-hidden={collapsed}
        sx={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: sidebar.sectionLabel,
          px: 3,
          mb: 2,
          height: collapsed ? 0 : 16,
          overflow: 'hidden',
          opacity: collapsed ? 0 : 1,
          transition: `opacity ${duration.fast}ms ${easing.easeOut}, height ${duration.fast}ms ${easing.easeOut}`,
        }}
      >
        {label}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>{children}</Box>
    </Box>
  );
}
