import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Drawer } from '@/ui/layout/Drawer';
import { Icon } from '@/ui/foundation/Icon';
import { NAV_GROUPS } from './navItems';

export interface AppMobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * The mobile (xs) navigation surface — the same NAV_GROUPS as the desktop
 * sidebar, presented as a left-edge Drawer since there is no room for a
 * persistent rail below the `sm` breakpoint.
 */
export function AppMobileDrawer({ open, onClose }: AppMobileDrawerProps) {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer open={open} onClose={onClose} side="left" width={280} title="Navigation">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {NAV_GROUPS.map((group) => (
          <Box key={group.label} component="section" aria-label={group.label}>
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                px: 1,
                mb: 2,
              }}
            >
              {group.label}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ButtonBase
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      height: 44,
                      px: 3,
                      borderRadius: 1.5,
                      justifyContent: 'flex-start',
                      color: active ? 'primary.main' : theme.palette.text.primary,
                      backgroundColor: active ? 'action.selected' : 'transparent',
                    }}
                  >
                    <Icon name={item.icon} size={18} />
                    <Box component="span" sx={{ fontSize: 14, flex: 1, textAlign: 'left' }}>
                      {item.label}
                    </Box>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Drawer>
  );
}
