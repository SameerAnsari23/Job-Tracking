import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Auth shell — bootstrap version. The final split-screen layout with the
 * gradient brand panel (Phase 16.3 §1.1) lands with the Authentication
 * milestone; this centers the outlet and carries the wordmark.
 */
export function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 10 }}>
        <Typography
          component="span"
          sx={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}
        >
          ◆ JobNotify
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          pb: 20,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
