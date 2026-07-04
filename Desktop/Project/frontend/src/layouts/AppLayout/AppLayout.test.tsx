import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { mockMatchMedia } from '@/test/mockMatchMedia';
import { useUiStore } from '@/shared/stores/uiStore';
import { renderShell, signIn } from './tests/testUtils';
import { AppLayout } from './AppLayout';

describe('AppLayout — responsive tiers', () => {
  let restoreMatchMedia: () => void;

  beforeEach(() => {
    signIn();
    useUiStore.setState({ sidebarCollapsed: false });
  });

  afterEach(() => {
    restoreMatchMedia?.();
  });

  it('desktop (≥1200px): shows the persistent sidebar, no bottom nav, no drawer', () => {
    restoreMatchMedia = mockMatchMedia(1440);
    renderShell(<AppLayout />);

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist', { name: 'Primary' })).not.toBeInTheDocument();
  });

  it('tablet (600–1199px): sidebar is forced collapsed and the toggle is hidden', () => {
    restoreMatchMedia = mockMatchMedia(900);
    renderShell(<AppLayout />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveAttribute('data-state', 'collapsed');
    expect(screen.queryByRole('button', { name: 'Expand sidebar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Collapse sidebar' })).not.toBeInTheDocument();
  });

  it('mobile (<600px): no persistent sidebar, shows a hamburger and a bottom tab bar', () => {
    restoreMatchMedia = mockMatchMedia(375);
    renderShell(<AppLayout />);

    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Primary' })).toBeInTheDocument();
  });

  it('mobile: the hamburger opens the drawer with the same nav destinations', async () => {
    restoreMatchMedia = mockMatchMedia(375);
    const user = userEvent.setup();
    renderShell(<AppLayout />);

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(await screen.findByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument();
  });

  it('desktop: the sidebar collapse toggle persists to uiStore', async () => {
    restoreMatchMedia = mockMatchMedia(1440);
    const user = userEvent.setup();
    renderShell(<AppLayout />);

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    expect(await screen.findByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });
});

describe('AppLayout — accessibility & structure', () => {
  let restoreMatchMedia: () => void;

  beforeEach(() => {
    signIn();
    restoreMatchMedia = mockMatchMedia(1440);
  });

  afterEach(() => restoreMatchMedia());

  it('exposes exactly one main landmark containing the routed page', () => {
    renderShell(<AppLayout />, { content: <div>Unique page marker</div> });
    const main = screen.getByRole('main');
    expect(main).toHaveTextContent('Unique page marker');
  });

  it('has a skip-to-content link targeting the main landmark', () => {
    renderShell(<AppLayout />);
    const skipLink = screen.getByRole('link', { name: 'Skip to content' });
    const main = screen.getByRole('main');
    expect(skipLink).toHaveAttribute('href', `#${main.id}`);
  });

  it('moves focus to the main landmark on arrival (and thus on every location.pathname change)', async () => {
    renderShell(<AppLayout />, { route: '/dashboard' });
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus());
  });

  it('has no axe violations on the desktop shell', async () => {
    const { container } = renderShell(<AppLayout />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
