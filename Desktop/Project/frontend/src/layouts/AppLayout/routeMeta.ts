import type { IconName } from '@/ui/foundation/Icon';

export interface RouteMeta {
  path: string;
  label: string;
  icon: IconName;
  /** For Breadcrumb trail-building — omitted for top-level destinations. */
  parentPath?: string;
}

/**
 * Static path → metadata map (Application Shell, Phase 18.1). Drives the
 * sidebar, breadcrumb trail, and command palette's navigation group — a
 * single source of truth so none of them can drift from the route tree.
 * Purely structural (label/icon/hierarchy); it carries no business data.
 */
export const ROUTE_META: RouteMeta[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/jobs', label: 'Job Search', icon: 'briefcase' },
  { path: '/jobs/saved', label: 'Saved Jobs', icon: 'bookmark', parentPath: '/jobs' },
  {
    path: '/jobs/recommendations',
    label: 'Recommendations',
    icon: 'compass',
    parentPath: '/jobs',
  },
  { path: '/discovery', label: 'Discovery', icon: 'radar' },
  { path: '/notifications', label: 'Notifications', icon: 'bell' },
  { path: '/profile', label: 'Profile', icon: 'user' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
  {
    path: '/settings/notifications',
    label: 'Notification Settings',
    icon: 'settings',
    parentPath: '/settings',
  },
  {
    path: '/settings/job-search',
    label: 'Job Search Settings',
    icon: 'settings',
    parentPath: '/settings',
  },
];

const BY_PATH = new Map(ROUTE_META.map((route) => [route.path, route]));

/** Exact-match lookup; falls back to a prefix match for dynamic segments (e.g. /jobs/:jobId). */
export function findRouteMeta(pathname: string): RouteMeta | undefined {
  const exact = BY_PATH.get(pathname);
  if (exact) return exact;

  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const candidate = BY_PATH.get(`/${segments.join('/')}`);
    if (candidate) return candidate;
  }
  return undefined;
}

/** Builds the ancestor chain (root-first) for Breadcrumb, ending at `pathname` itself. */
export function buildBreadcrumbTrail(pathname: string): RouteMeta[] {
  const current = findRouteMeta(pathname);
  if (!current) return [];

  const trail: RouteMeta[] = [current];
  let parentPath = current.parentPath;
  while (parentPath) {
    const parent = BY_PATH.get(parentPath);
    if (!parent) break;
    trail.unshift(parent);
    parentPath = parent.parentPath;
  }
  return trail;
}
