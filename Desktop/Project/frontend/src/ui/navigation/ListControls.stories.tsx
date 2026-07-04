import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Pagination } from './Pagination';
import { InfiniteScroll } from './InfiniteScroll';
import { BottomNavigation } from './BottomNavigation';
import { Typography } from '../foundation/Typography';

const meta: Meta = { title: 'Navigation/Pagination · InfiniteScroll · BottomNavigation' };
export default meta;

function NumberedDemo() {
  const [page, setPage] = useState(4);
  const [pageSize, setPageSize] = useState(20);
  return (
    <Pagination
      mode="numbered"
      currentPage={page}
      totalPages={12}
      onPageChange={setPage}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageSizeChange={setPageSize}
    />
  );
}

export const Numbered: StoryObj = { render: () => <NumberedDemo /> };

export const NumberedCompactMobile: StoryObj = {
  render: () => <NumberedDemo />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const LoadMore: StoryObj = {
  render: () => <Pagination mode="loadMore" hasMore onLoadMore={() => {}} />,
};

export const LoadMoreEnd: StoryObj = {
  render: () => <Pagination mode="loadMore" hasMore={false} />,
};

function InfiniteScrollDemo() {
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const end = count >= 18;

  return (
    <Box sx={{ maxWidth: 480, height: 360, overflowY: 'auto', border: 1, borderColor: 'divider' }}>
      <InfiniteScroll
        onReach={() => {
          if (loading || end) return;
          setLoading(true);
          setTimeout(() => {
            setCount((c) => c + 6);
            setLoading(false);
          }, 600);
        }}
        loading={loading}
        end={end}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          {Array.from({ length: count }, (_, i) => (
            <Box
              key={i}
              sx={{ height: 88, border: 1, borderColor: 'divider', borderRadius: 1, p: 3 }}
            >
              <Typography variant="textSm">Job card {i + 1}</Typography>
            </Box>
          ))}
        </Box>
      </InfiniteScroll>
    </Box>
  );
}

export const InfiniteScrollDemoStory: StoryObj = { render: () => <InfiniteScrollDemo /> };

export const InfiniteScrollError: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <InfiniteScroll onReach={() => {}} error="Couldn't load more jobs" onRetry={() => {}}>
        <Typography variant="textSm">6 jobs loaded</Typography>
      </InfiniteScroll>
    </Box>
  ),
};

function BottomNavDemo() {
  const [active, setActive] = useState('dashboard');
  return (
    <BottomNavigation
      activeValue={active}
      items={[
        {
          value: 'dashboard',
          icon: 'dashboard',
          label: 'Home',
          onClick: () => setActive('dashboard'),
        },
        { value: 'jobs', icon: 'briefcase', label: 'Search', onClick: () => setActive('jobs') },
        {
          value: 'discovery',
          icon: 'radar',
          label: 'Discovery',
          onClick: () => setActive('discovery'),
        },
        {
          value: 'notifications',
          icon: 'bell',
          label: 'Alerts',
          badge: 3,
          onClick: () => setActive('notifications'),
        },
        { value: 'profile', icon: 'user', label: 'Profile', onClick: () => setActive('profile') },
      ]}
    />
  );
}

export const BottomNav: StoryObj = {
  render: () => <BottomNavDemo />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const BottomNavRovingTabIndex: StoryObj = {
  render: () => <BottomNavDemo />,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('tab', { name: 'Home' });
    home.focus();
    await expect(home).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('tab', { name: 'Search' })).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Search' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'Profile' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'Home' })).toHaveFocus();
  },
};
