import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Timeline } from './Timeline';
import { ActivityFeed } from './ActivityFeed';
import { NotificationItem } from './NotificationItem';
import type { NotificationData } from './NotificationItem';

describe('Timeline', () => {
  it('renders items as an ordered list', () => {
    renderWithTheme(
      <Timeline items={[{ id: '1', title: 'Product Manager', timestamp: '2020 — 2023' }]} />,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('2020 — 2023')).toBeInTheDocument();
  });

  it('renders a group header only when the group changes between items', () => {
    renderWithTheme(
      <Timeline
        items={[
          { id: '1', group: 'Today', title: 'A' },
          { id: '2', group: 'Today', title: 'B' },
          { id: '3', group: 'Yesterday', title: 'C' },
        ]}
      />,
    );
    expect(screen.getAllByText('Today')).toHaveLength(1);
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
  });

  it('expandable items start collapsed and toggle on click', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Timeline items={[{ id: '1', title: 'Role', expandable: true, description: 'Full text' }]} />,
    );
    expect(screen.getByText('Full text')).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByText('Full text')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument();
  });

  it('non-expandable descriptions always render', () => {
    renderWithTheme(
      <Timeline items={[{ id: '1', title: 'Role', description: 'Always visible' }]} />,
    );
    expect(screen.getByText('Always visible')).toBeVisible();
  });
});

describe('ActivityFeed', () => {
  inBothThemes('renders items with tone dots and timestamps', (mode) => {
    renderWithTheme(
      <ActivityFeed items={[{ id: '1', text: 'New match', timestamp: '2h ago' }]} />,
      mode,
    );
    expect(screen.getByRole('list', { name: 'Recent activity' })).toBeInTheDocument();
    expect(screen.getByText('New match')).toBeInTheDocument();
  });

  it('caps items at maxItems and renders the footer link', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      text: `Item ${i}`,
      timestamp: 'now',
    }));
    renderWithTheme(
      <ActivityFeed
        items={items}
        maxItems={3}
        footerHref="/notifications"
        footerLabel="View all"
      />,
    );
    expect(screen.getAllByText(/Item \d/)).toHaveLength(3);
    expect(screen.getByRole('link', { name: /View all/ })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });

  it('shows loading, empty, and error states', () => {
    const { rerender } = renderWithTheme(<ActivityFeed items={[]} loading />);
    expect(screen.getByRole('status', { name: 'Loading activity' })).toBeInTheDocument();

    rerender(<ActivityFeed items={[]} />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();

    rerender(<ActivityFeed items={[]} error="Couldn't load" onRetry={() => {}} />);
    expect(screen.getByText("Couldn't load")).toBeInTheDocument();
  });
});

const NOTIF: NotificationData = {
  id: '1',
  icon: 'star',
  title: 'New match: Senior Engineer at Notion',
  body: 'Matches your Backend Engineer profile',
  timestamp: '3 hours ago',
  read: false,
};

describe('NotificationItem', () => {
  inBothThemes('unread items show the unread dot; read items do not', (mode) => {
    const { rerender } = renderWithTheme(<NotificationItem notification={NOTIF} />, mode);
    expect(screen.getByRole('status', { name: 'Unread' })).toBeInTheDocument();
    rerender(<NotificationItem notification={{ ...NOTIF, read: true }} />);
    expect(screen.queryByRole('status', { name: 'Unread' })).not.toBeInTheDocument();
  });

  it('clicking the row marks it read and navigates', async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();
    const onNavigate = vi.fn();
    renderWithTheme(
      <NotificationItem notification={NOTIF} onRead={onRead} onNavigate={onNavigate} />,
    );
    await user.click(screen.getByRole('button', { name: /New match/ }));
    expect(onRead).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it('does not call onRead again for an already-read notification', async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();
    renderWithTheme(<NotificationItem notification={{ ...NOTIF, read: true }} onRead={onRead} />);
    await user.click(screen.getByRole('button', { name: /New match/ }));
    expect(onRead).not.toHaveBeenCalled();
  });

  it('renders a delete button with an accessible name including the title', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithTheme(<NotificationItem notification={NOTIF} onDelete={onDelete} />);
    const deleteButton = screen.getByRole('button', { name: /Delete notification: New match/ });
    await user.click(deleteButton);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('drawer density uses a smaller row', () => {
    const { container } = renderWithTheme(
      <NotificationItem notification={NOTIF} density="drawer" />,
    );
    expect(container.firstElementChild).toHaveStyle({ minHeight: '68px' });
  });

  it('has no axe violations read or unread', async () => {
    const { container, rerender } = renderWithTheme(
      <NotificationItem notification={NOTIF} onDelete={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
    rerender(<NotificationItem notification={{ ...NOTIF, read: true }} onDelete={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
