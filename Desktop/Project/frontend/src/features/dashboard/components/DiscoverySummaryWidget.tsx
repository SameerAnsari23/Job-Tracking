import { Link as RouterLink } from 'react-router-dom';
import { Widget } from '@/ui/layout/Widget';
import { EmptyState } from '@/ui/layout/EmptyState';
import { DiscoveryStatus } from '@/ui/domain/DiscoveryStatus';
import { Link } from '@/ui/foundation/Link';
import { useDiscoverySummary } from '../hooks/useDiscoverySummary';

/**
 * One overall DiscoveryStatus banner (Phase 17.7 domain component), not a
 * per-profile card list — pausing/resuming/editing an individual profile is
 * Discovery feature territory, out of scope here. This widget only reports
 * counts derived from the real /discovery response.
 */
export function DiscoverySummaryWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoverySummary();

  const activeCount = data?.profiles.filter((p) => p.isActive).length ?? 0;
  const totalCount = data?.profiles.length ?? 0;
  const totalCompanies = data?.profiles.reduce((sum, p) => sum + p.watchedCompanyCount, 0) ?? 0;

  return (
    <Widget
      title="Discovery"
      action={
        <Link href="/discovery" routerComponent={RouterLink}>
          View all
        </Link>
      }
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load discovery status.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && data.profiles.length === 0}
      emptyState={
        <EmptyState
          icon="radar"
          title="No discovery profiles yet"
          description="Set up discovery to get matched automatically as new jobs appear."
          action={
            <Link href="/discovery" routerComponent={RouterLink}>
              Set up discovery
            </Link>
          }
        />
      }
    >
      {data && data.profiles.length > 0 && (
        <DiscoveryStatus
          state={data.isActive ? 'active' : 'paused'}
          summary={`${activeCount} of ${totalCount} profile${totalCount === 1 ? '' : 's'} active · watching ${totalCompanies} compan${totalCompanies === 1 ? 'y' : 'ies'}`}
        />
      )}
    </Widget>
  );
}
