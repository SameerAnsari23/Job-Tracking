import type { IconName } from '@/ui/foundation/Icon';

export interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Sidebar/drawer navigation structure (Application Shell, Phase 18.1). */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/jobs', label: 'Job Search', icon: 'briefcase' },
      { path: '/discovery', label: 'Discovery', icon: 'radar' },
      { path: '/notifications', label: 'Notifications', icon: 'bell' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { path: '/jobs/saved', label: 'Saved Jobs', icon: 'bookmark' },
      { path: '/profile', label: 'Profile', icon: 'user' },
      { path: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

/** The 5 items shown on the mobile bottom tab bar (BottomNavigation's own limit). */
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/jobs', label: 'Jobs', icon: 'briefcase' },
  { path: '/discovery', label: 'Discovery', icon: 'radar' },
  { path: '/notifications', label: 'Alerts', icon: 'bell' },
  { path: '/profile', label: 'Profile', icon: 'user' },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
