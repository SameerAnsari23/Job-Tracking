import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Sidebar } from './Sidebar';
import { SidebarGroup } from './SidebarGroup';
import { SidebarItem } from './SidebarItem';
import { SidebarFooter } from './SidebarFooter';
import { SidebarCollapseButton } from './SidebarCollapseButton';

function BasicSidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Sidebar collapsed={collapsed} aria-label="Main">
      <SidebarGroup label="Workspace">
        <SidebarItem icon="dashboard" label="Dashboard" onClick={() => {}} />
        <SidebarItem icon="briefcase" label="Job Search" active onClick={() => {}} />
        <SidebarItem icon="bell" label="Notifications" badge={3} onClick={() => {}} />
        <SidebarItem icon="compass" label="Recommendations" disabled onClick={() => {}} />
      </SidebarGroup>
    </Sidebar>
  );
}

describe('Sidebar', () => {
  inBothThemes('renders a nav landmark with the expanded/collapsed state', (mode) => {
    renderWithTheme(<BasicSidebar />, mode);
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveAttribute(
      'data-state',
      'expanded',
    );
  });

  it('marks the active item with aria-current="page"', () => {
    renderWithTheme(<BasicSidebar />);
    expect(screen.getByRole('button', { name: 'Job Search' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });

  it('renders the badge count with an accessible name', () => {
    renderWithTheme(<BasicSidebar />);
    expect(screen.getByLabelText('3 unread')).toBeInTheDocument();
  });

  it('disabled items are inert (aria-disabled, click gated) and excluded from arrow-key traversal', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTheme(
      <Sidebar collapsed={false} aria-label="Main">
        <SidebarGroup label="Workspace">
          <SidebarItem icon="dashboard" label="Dashboard" onClick={() => {}} />
          <SidebarItem icon="briefcase" label="Job Search" active onClick={() => {}} />
          <SidebarItem icon="bell" label="Notifications" badge={3} onClick={() => {}} />
          <SidebarItem icon="compass" label="Recommendations" disabled onClick={onClick} />
        </SidebarGroup>
      </Sidebar>,
    );
    const disabled = screen.getByRole('button', { name: 'Recommendations' });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await user.click(disabled);
    expect(onClick).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Dashboard' }).focus();
    await user.keyboard('{ArrowUp}'); // wraps backward, skipping the disabled item
    expect(screen.getByRole('button', { name: /Notifications/ })).toHaveFocus();
  });

  it('ArrowDown/ArrowUp move focus across items; Tab order is unaffected (hybrid model)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<BasicSidebar />);
    const dashboard = screen.getByRole('button', { name: 'Dashboard' });
    dashboard.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Job Search' })).toHaveFocus();
    // every item keeps tabIndex 0 — not a strict roving pattern
    for (const name of ['Dashboard', 'Job Search']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('tabIndex', '0');
    }
  });

  it('collapsed mode wraps items in a Tooltip carrying the label', async () => {
    const user = userEvent.setup();
    renderWithTheme(<BasicSidebar collapsed />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-state', 'collapsed');
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Dashboard');
  });

  it('has no axe violations expanded or collapsed', async () => {
    const { container, rerender } = renderWithTheme(<BasicSidebar />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<BasicSidebar collapsed />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('SidebarCollapseButton', () => {
  it('toggles aria-pressed and the accessible name', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = renderWithTheme(
      <SidebarCollapseButton collapsed={false} onToggle={onToggle} />,
    );
    const button = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await user.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(<SidebarCollapseButton collapsed onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('SidebarFooter', () => {
  it('renders its children', () => {
    renderWithTheme(
      <SidebarFooter>
        <span>user row</span>
      </SidebarFooter>,
    );
    expect(screen.getByText('user row')).toBeInTheDocument();
  });
});
