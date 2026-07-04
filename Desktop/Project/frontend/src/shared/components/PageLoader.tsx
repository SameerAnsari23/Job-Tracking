import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Full-screen splash shown while SessionGate resolves the session and as
 * the Suspense fallback for lazy routes.
 */
export function PageLoader() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-label="Loading"
    >
      <CircularProgress size={32} />
    </Box>
  );
}
