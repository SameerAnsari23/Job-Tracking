import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { sidebar } from '@/theme';

export interface SidebarFooterProps {
  children: ReactNode;
}

/**
 * Bottom-pinned slot (user row, settings/logout links) — a hairline
 * divider above it separates it from the scrollable nav region, per
 * Phase 16.2's sidebar anatomy.
 */
export function SidebarFooter({ children }: SidebarFooterProps) {
  return <Box sx={{ borderTop: `1px solid ${sidebar.border}`, px: 3, py: 3 }}>{children}</Box>;
}
