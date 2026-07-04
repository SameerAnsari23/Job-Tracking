import { Link as RouterLink } from 'react-router-dom';
import { Widget } from '@/ui/layout/Widget';
import { ActivityFeed } from '@/ui/data-display/ActivityFeed';
import { Link } from '@/ui/foundation/Link';
import { useRecentJobMatches } from '../hooks/useRecentJobMatches';
import { formatRelativeTime } from './internal/formatRelativeTime';

/**
 * There is no generic activity-log endpoint on the backend — this widget
 * is honestly the most recent job matches surfaced for the user, which
 * ActivityFeed's tone/text/timestamp shape maps onto directly. ActivityFeed
 * owns its own loading/error/empty presentation, so Widget here is chrome
 * only (title + "View all") — not a second state machine on top of it.
 */
export function RecentActivityWidget() {
  const { data, isLoading, isError, error, refetch } = useRecentJobMatches();

  return (
    <Widget
      title="Recent Activity"
      action={
        <Link href="/jobs" routerComponent={RouterLink}>
          View all
        </Link>
      }
    >
      <ActivityFeed
        loading={isLoading}
        error={isError ? (error as Error).message || 'Could not load recent activity.' : null}
        onRetry={() => {
          void refetch();
        }}
        emptyMessage="No new matches yet"
        items={(data?.items ?? []).map((job) => ({
          id: job.jobId,
          tone: 'accent',
          text: `New match: ${job.title} at ${job.companyName}`,
          timestamp: formatRelativeTime(job.publishedAt),
          href: `/jobs/${job.jobId}`,
        }))}
      />
    </Widget>
  );
}
