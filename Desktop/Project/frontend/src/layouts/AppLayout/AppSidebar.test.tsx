import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderShell, signIn } from './tests/testUtils';
import { AppSidebar } from './AppSidebar';

describe('AppSidebar', () => {
  beforeEach(() => signIn('jane@example.com'));

  it('renders every nav group and marks the current route active', () => {
    renderShell(
      <AppSidebar collapsed={false} toggleable onToggleCollapse={() => {}} />,
      { route: '/dashboard' },
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Job Search' })).not.toHaveAttribute('aria-current');
  });

  it('shows the signed-in user identity in the footer', () => {
    renderShell(<AppSidebar collapsed={false} toggleable onToggleCollapse={() => {}} />);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('hides the collapse toggle when not toggleable (tablet)', () => {
    renderShell(<AppSidebar collapsed toggleable={false} onToggleCollapse={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();
  });

  it('calls onToggleCollapse when toggleable', async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();
    renderShell(
      <AppSidebar collapsed={false} toggleable onToggleCollapse={onToggleCollapse} />,
    );

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onToggleCollapse).toHaveBeenCalledOnce();
  });

  it('has no axe violations expanded', async () => {
    const { container } = renderShell(
      <AppSidebar collapsed={false} toggleable onToggleCollapse={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations collapsed', async () => {
    const { container } = renderShell(
      <AppSidebar collapsed toggleable onToggleCollapse={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
