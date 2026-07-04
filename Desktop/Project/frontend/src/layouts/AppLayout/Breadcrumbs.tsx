import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/ui/navigation/Breadcrumb';
import { buildBreadcrumbTrail } from './routeMeta';

const HOME_CRUMB = { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' as const };

/** Route-aware Breadcrumb — derives its trail from routeMeta, never business data. */
export function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const trail = buildBreadcrumbTrail(location.pathname);
  if (trail.length === 0) return null;

  const items =
    trail[0]?.path === HOME_CRUMB.href
      ? trail.map((r) => ({ label: r.label, href: r.path, icon: r.icon }))
      : [HOME_CRUMB, ...trail.map((r) => ({ label: r.label, href: r.path, icon: r.icon }))];

  return (
    <Breadcrumb items={items} routerComponent={RouterLink} onNavigate={(href) => navigate(href)} />
  );
}
