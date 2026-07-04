import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { TopNavigation } from './TopNavigation';
import { Breadcrumb } from './Breadcrumb';
import { PageHeader } from './PageHeader';

describe('TopNavigation', () => {
  inBothThemes('renders every slot as a sticky header landmark', (mode) => {
    renderWithTheme(
      <TopNavigation
        start={<span>Logo</span>}
        search={<span>Search</span>}
        actions={<span>Actions</span>}
        notifications={<span>Bell</span>}
        profile={<span>Avatar</span>}
      />,
      mode,
    );
    const header = screen.getByRole('banner');
    expect(header).toContainElement(screen.getByText('Logo'));
    expect(header).toContainElement(screen.getByText('Search'));
    expect(header).toContainElement(screen.getByText('Actions'));
    expect(header).toContainElement(screen.getByText('Bell'));
    expect(header).toContainElement(screen.getByText('Avatar'));
  });

  it('renders no slot content it was not given', () => {
    renderWithTheme(<TopNavigation start={<span>Only start</span>} />);
    expect(screen.getByText('Only start')).toBeInTheDocument();
  });
});

describe('Breadcrumb', () => {
  it('marks the last item aria-current="page" and renders it as plain text', () => {
    renderWithTheme(
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Job Search' }]} />,
    );
    const current = screen.getByText('Job Search');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Job Search' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
  });

  it('renders icons alongside labels', () => {
    renderWithTheme(
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/d', icon: 'dashboard' }, { label: 'Jobs' }]}
      />,
    );
    expect(
      screen.getByRole('link', { name: 'Dashboard' }).querySelector('svg'),
    ).toBeInTheDocument();
  });

  it('collapses the middle into an ellipsis menu beyond maxVisible', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/d' },
          { label: 'Discovery', href: '/disc' },
          { label: 'Backend Engineer', href: '/disc/1' },
          { label: 'Edit', href: '/disc/1/edit' },
          { label: 'Target roles' },
        ]}
        maxVisible={3}
      />,
    );
    // First + ellipsis + last 2 are visible; the middle 2 are hidden.
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Discovery' })).not.toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Target roles')).toHaveAttribute('aria-current', 'page');

    const ellipsis = screen.getByRole('button', { name: 'Show hidden breadcrumb items' });
    await user.click(ellipsis);
    expect(await screen.findByRole('menuitem', { name: 'Discovery' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Backend Engineer' })).toBeInTheDocument();
  });

  it('routes hidden-item selection through onNavigate when provided', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithTheme(
      <Breadcrumb
        onNavigate={onNavigate}
        maxVisible={2}
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C', href: '/c' },
          { label: 'D' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Show hidden breadcrumb items' }));
    await user.click(await screen.findByRole('menuitem', { name: 'B' }));
    expect(onNavigate).toHaveBeenCalledWith('/b');
  });

  it('has no axe violations when collapsed', async () => {
    const { container } = renderWithTheme(
      <Breadcrumb
        maxVisible={2}
        items={[
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C', href: '/c' },
          { label: 'D' },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('PageHeader', () => {
  it('renders the title as the page h1 and an optional description', () => {
    renderWithTheme(<PageHeader title="Discovery" description="Automated matching." />);
    expect(screen.getByRole('heading', { name: 'Discovery', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Automated matching.')).toBeInTheDocument();
  });

  it('renders a back link when backHref is given', () => {
    renderWithTheme(<PageHeader title="Job Details" backHref="/jobs" />);
    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', '/jobs');
  });

  it('renders actions and tabs slots', () => {
    renderWithTheme(
      <PageHeader
        title="Profile"
        actions={<button>New</button>}
        tabs={<div data-testid="tabs-slot" />}
      />,
    );
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
    expect(screen.getByTestId('tabs-slot')).toBeInTheDocument();
  });
});
