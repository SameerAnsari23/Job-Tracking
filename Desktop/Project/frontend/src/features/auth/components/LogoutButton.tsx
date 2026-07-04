import { Button } from '@/ui/foundation/Button';
import { Icon } from '@/ui/foundation/Icon';
import { useLogout } from '../hooks/useLogout';

export interface LogoutButtonProps {
  onLoggedOut?: () => void;
}

/**
 * Reusable sign-out control (Phase 18.0). Not mounted anywhere yet — the
 * app chrome that would host it (sidebar/topbar) is Application Shell's
 * scope (Phase 18.1). The underlying logout flow is complete and tested
 * here; this is the drop-in trigger for it.
 */
export function LogoutButton({ onLoggedOut }: LogoutButtonProps) {
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      iconStart={<Icon name="logOut" size={16} />}
      loading={logout.isPending}
      onClick={() => logout.mutate(undefined, { onSuccess: onLoggedOut })}
    >
      Sign out
    </Button>
  );
}
