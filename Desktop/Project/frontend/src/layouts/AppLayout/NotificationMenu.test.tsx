import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderShell } from './tests/testUtils';
import { NotificationMenu } from './NotificationMenu';

describe('NotificationMenu', () => {
  it('opens a drawer with an honest empty state — no fabricated unread count', async () => {
    const user = userEvent.setup();
    renderShell(<NotificationMenu />);

    expect(screen.queryByText(/\d/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('links out to the full Notifications page', async () => {
    const user = userEvent.setup();
    renderShell(<NotificationMenu />);
    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(await screen.findByRole('link', { name: 'Go to Notifications' })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderShell(<NotificationMenu />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
