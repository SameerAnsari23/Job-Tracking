import { Widget } from '@/ui/layout/Widget';
import { EmptyState } from '@/ui/layout/EmptyState';
import { Timeline } from '@/ui/data-display/Timeline';
import { useDiscoveryActivity } from '../hooks/useDiscoveryActivity';
import { formatRelativeTime } from './internal/formatRelativeTime';

/**
 * There is no discovery execution/audit-log endpoint on the backend — this
 * is honestly the job-recommendations feed (matches surfaced BY discovery),
 * the only real signal tied to what discovery has actually found.
 */
export function DiscoveryActivityWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryActivity();

  return (
    <Widget
      title="Discovery Activity"
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load discovery activity.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && data.length === 0}
      emptyState={
        <EmptyState icon="radar" title="No matches yet" description="New matches from your discovery profiles will appear here." />
      }
    >
      {data && data.length > 0 && (
        <Timeline
          items={data.map((match) => ({
            id: match.jobId,
            icon: 'radar',
            tone: 'accent',
            title: `${match.title} at ${match.companyName}`,
            timestamp: formatRelativeTime(match.publishedAt),
          }))}
        />
      )}
    </Widget>
  );
}
