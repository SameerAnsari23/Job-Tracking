import { screen } from '@testing-library/react';
import { renderShell } from './tests/testUtils';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders a single current-page crumb for the dashboard itself', () => {
    renderShell(<Breadcrumbs />, { route: '/dashboard' });
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveTextContent('Dashboard');
    expect(screen.getByText('Dashboard')).toHaveAttribute('aria-current', 'page');
  });

  it('builds the full ancestor trail for a nested route, prefixed with Dashboard', () => {
    renderShell(<Breadcrumbs />, { route: '/jobs/saved' });
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveTextContent(/Dashboard.*Job Search.*Saved Jobs/s);
    expect(screen.getByText('Saved Jobs')).toHaveAttribute('aria-current', 'page');
  });

  it('renders nothing for an unrecognized route', () => {
    const { container } = renderShell(<Breadcrumbs />, { route: '/unknown-page' });
    expect(container).toBeEmptyDOMElement();
  });
});
