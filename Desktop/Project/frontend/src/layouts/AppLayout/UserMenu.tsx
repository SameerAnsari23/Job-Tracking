import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import { Avatar } from '@/ui/foundation/Avatar';
import { Menu } from '@/ui/layout/Menu';
import { useAuthStore } from '@/shared/stores/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';

/** Avatar trigger + account menu, including the shell's logout integration. */
export function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const logout = useLogout();

  const displayName = user?.email ?? 'Account';

  return (
    <>
      <ButtonBase
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        sx={{ borderRadius: '50%' }}
      >
        <Avatar name={displayName} size={32} />
      </ButtonBase>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        aria-label="Account menu"
        items={[
          { icon: 'user', label: 'Profile', onSelect: () => navigate('/profile') },
          { icon: 'settings', label: 'Settings', onSelect: () => navigate('/settings') },
          {
            icon: 'logOut',
            label: 'Sign out',
            destructive: true,
            divider: true,
            onSelect: () => logout.mutate(undefined, { onSuccess: () => navigate('/login') }),
          },
        ]}
      />
    </>
  );
}
