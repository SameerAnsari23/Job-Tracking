import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderShell, signIn } from './tests/testUtils';
import { AppMobileDrawer } from './AppMobileDrawer';
import { AppBottomNav } from './AppBottomNav';

describe('AppMobileDrawer', () => {
  beforeEach(() => signIn());

  it('lists every nav group and closes on item click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderShell(<AppMobileDrawer open onClose={onClose} />);

    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Discovery/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders nothing accessible when closed', () => {
    renderShell(<AppMobileDrawer open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    const { container } = renderShell(<AppMobileDrawer open onClose={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('AppBottomNav', () => {
  beforeEach(() => signIn());

  it('renders a tablist with the 5 primary destinations and marks the active one', () => {
    renderShell(<AppBottomNav />, { route: '/dashboard' });
    const tab = screen.getByRole('tab', { name: 'Dashboard' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('has no axe violations', async () => {
    const { container } = renderShell(<AppBottomNav />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
