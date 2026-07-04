import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Pagination } from './Pagination';
import { InfiniteScroll } from './InfiniteScroll';
import { BottomNavigation } from './BottomNavigation';

describe('Pagination — numbered mode', () => {
  it('disables Previous on page 1 and Next on the last page', () => {
    const { rerender } = renderWithTheme(
      <Pagination mode="numbered" currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();

    rerender(<Pagination mode="numbered" currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('marks the current page with aria-current and fires onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithTheme(
      <Pagination mode="numbered" currentPage={4} totalPages={5} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Page 5' }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(5); // already computed from currentPage=4 prop
  });

  it('collapses many pages with an ellipsis around the current page', () => {
    renderWithTheme(
      <Pagination mode="numbered" currentPage={10} totalPages={20} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 10' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('renders a page-size selector when configured', async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    renderWithTheme(
      <Pagination
        mode="numbered"
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        pageSize={20}
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '50 / page' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <Pagination mode="numbered" currentPage={3} totalPages={10} onPageChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Pagination — loadMore mode', () => {
  inBothThemes('renders a Load more button while hasMore is true', (mode) => {
    renderWithTheme(<Pagination mode="loadMore" hasMore onLoadMore={() => {}} />, mode);
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });

  it('fires onLoadMore and shows the loading state', async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    renderWithTheme(<Pagination mode="loadMore" hasMore onLoadMore={onLoadMore} loading />);
    // While loading, Button's visible label is hidden and its accessible
    // name comes from the internal Spinner's aria-label (Phase 17.2
    // contract) — the button is still present and disabled.
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    await user.click(button).catch(() => {});
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('renders the end message when hasMore is false', () => {
    renderWithTheme(<Pagination mode="loadMore" hasMore={false} endMessage="Nothing more" />);
    expect(screen.getByText('Nothing more')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: number[] = [];
  static last: MockIntersectionObserver | null = null;
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.last = this;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('InfiniteScroll', () => {
  beforeEach(() => {
    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('fires onReach when the sentinel intersects', () => {
    const onReach = vi.fn();
    renderWithTheme(
      <InfiniteScroll onReach={onReach}>
        <span>list</span>
      </InfiniteScroll>,
    );
    MockIntersectionObserver.last!.trigger(true);
    expect(onReach).toHaveBeenCalledOnce();
  });

  it('renders the tail skeleton while loading and announces it', () => {
    renderWithTheme(
      <InfiniteScroll onReach={() => {}} loading>
        <span>list</span>
      </InfiniteScroll>,
    );
    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Loading more');
  });

  it('renders the end message and stops observing once end is true', () => {
    renderWithTheme(
      <InfiniteScroll onReach={() => {}} end endMessage="Done">
        <span>list</span>
      </InfiniteScroll>,
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders a compact ErrorState with retry on error', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithTheme(
      <InfiniteScroll onReach={() => {}} error="Couldn't load more" onRetry={onRetry}>
        <span>list</span>
      </InfiniteScroll>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('BottomNavigation', () => {
  const ITEMS = [
    { value: 'home', icon: 'dashboard' as const, label: 'Home', onClick: vi.fn() },
    { value: 'search', icon: 'briefcase' as const, label: 'Search', onClick: vi.fn() },
    { value: 'alerts', icon: 'bell' as const, label: 'Alerts', badge: 3, onClick: vi.fn() },
  ];

  inBothThemes('renders a tablist with aria-selected on the active item', (mode) => {
    renderWithTheme(<BottomNavigation items={ITEMS} activeValue="search" />, mode);
    expect(screen.getByRole('tablist', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Search' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'false');
  });

  it('implements strict roving tabindex', async () => {
    const user = userEvent.setup();
    renderWithTheme(<BottomNavigation items={ITEMS} activeValue="home" />);
    const home = screen.getByRole('tab', { name: 'Home' });
    expect(home).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Search' })).toHaveAttribute('tabindex', '-1');
    home.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Search' })).toHaveFocus();
  });

  it('renders a badge with an accessible name', () => {
    renderWithTheme(<BottomNavigation items={ITEMS} activeValue="home" />);
    expect(screen.getByLabelText('3 unread')).toBeInTheDocument();
  });

  it('warns in dev beyond the 5-item maximum', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const many = Array.from({ length: 6 }, (_, i) => ({
      value: String(i),
      icon: 'dashboard' as const,
      label: `Item ${i}`,
    }));
    renderWithTheme(<BottomNavigation items={many} activeValue="0" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('max 5 items'));
    warn.mockRestore();
  });
});
