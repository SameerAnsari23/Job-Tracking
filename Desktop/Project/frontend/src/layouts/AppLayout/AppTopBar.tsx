import IconButton from '@mui/material/IconButton';
import { TopNavigation } from '@/ui/navigation/TopNavigation';
import { Icon } from '@/ui/foundation/Icon';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeSwitch } from './ThemeSwitch';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';
import { CommandPaletteHost } from './CommandPaletteHost';

export interface AppTopBarProps {
  /** Mobile only: hamburger opens AppMobileDrawer instead of showing the breadcrumb trail. */
  isMobile: boolean;
  onOpenMobileNav: () => void;
}

/** Composes the sticky top bar's slots — no slot owns business logic. */
export function AppTopBar({ isMobile, onOpenMobileNav }: AppTopBarProps) {
  return (
    <TopNavigation
      start={
        isMobile ? (
          <IconButton aria-label="Open navigation" onClick={onOpenMobileNav}>
            <Icon name="menu" size={20} />
          </IconButton>
        ) : (
          <Breadcrumbs />
        )
      }
      search={!isMobile && <CommandPaletteHost />}
      actions={<ThemeSwitch />}
      notifications={<NotificationMenu />}
      profile={<UserMenu />}
    />
  );
}
