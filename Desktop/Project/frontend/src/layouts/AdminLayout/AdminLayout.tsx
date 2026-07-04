import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { sidebar, layout } from '@/theme';

/**
 * Admin shell — bootstrap version. Same dark-spine structure as AppLayout
 * with admin-scoped navigation (blueprint Phase P). The /admin subtree is
 * flag-gated (`adminArea`) and excluded from the route tree by default.
 */
export function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        component="nav"
        aria-label="Admin"
        sx={{
          width: layout.sidebarWidth,
          flexShrink: 0,
          bgcolor: sidebar.bgLight,
          borderRight: `1px solid ${sidebar.border}`,
          p: 5,
        }}
      >
        <Typography sx={{ color: '#F0F0FA', fontWeight: 700 }}>◆ JobNotify Admin</Typography>
      </Box>
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
