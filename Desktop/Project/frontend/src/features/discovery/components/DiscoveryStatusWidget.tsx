import { Widget } from '@/ui/layout/Widget';
import { DiscoveryStatus } from '@/ui/domain/DiscoveryStatus';
import { Button } from '@/ui/foundation/Button';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';
import { useActivateDiscovery, useDeactivateDiscovery } from '../hooks/useDiscoveryProfileMutations';

/** The one real mutation surface for the global on/off switch. */
export function DiscoveryStatusWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryPreferences();
  const activate = useActivateDiscovery();
  const deactivate = useDeactivateDiscovery();

  const activeCount = data?.profiles.filter((p) => p.isActive).length ?? 0;
  const totalCount = data?.profiles.length ?? 0;
  const toggling = activate.isPending || deactivate.isPending;

  return (
    <Widget
      title="Discovery Status"
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load discovery status.' : null}
      onRetry={() => {
        void refetch();
      }}
    >
      {data && (
        <DiscoveryStatus
          state={data.isActive ? 'active' : 'paused'}
          summary={`${activeCount} of ${totalCount} profile${totalCount === 1 ? '' : 's'} active`}
          actionSlot={
            <Button
              variant={data.isActive ? 'secondary' : 'primary'}
              size="sm"
              loading={toggling}
              onClick={() => (data.isActive ? deactivate.mutate() : activate.mutate())}
            >
              {data.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          }
        />
      )}
    </Widget>
  );
}
