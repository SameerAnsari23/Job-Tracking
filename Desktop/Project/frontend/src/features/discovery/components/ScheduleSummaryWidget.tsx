import { Widget } from '@/ui/layout/Widget';
import { KeyValue } from '@/ui/data-display/KeyValue';
import { EmptyState } from '@/ui/layout/EmptyState';
import type { NotificationFrequency } from '../types/discovery.types';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';
import { FREQUENCY_LABEL } from './internal/discoveryLabels';

const FREQUENCY_ORDER: NotificationFrequency[] = ['REALTIME', 'DAILY', 'WEEKLY'];

/** Cadence is a per-profile setting, not a fabricated cron schedule — every count here comes straight from real profiles. */
export function ScheduleSummaryWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryPreferences();

  const counts = data
    ? FREQUENCY_ORDER.map((frequency) => ({
        frequency,
        count: data.profiles.filter((p) => p.notificationFrequency === frequency).length,
      })).filter((row) => row.count > 0)
    : [];

  return (
    <Widget
      title="Schedule Summary"
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load the schedule summary.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && data.profiles.length === 0}
      emptyState={<EmptyState icon="clock" title="No schedule yet — add a discovery profile first." />}
    >
      {data && data.profiles.length > 0 && (
        <KeyValue
          pairs={[
            {
              key: 'Global default',
              value: FREQUENCY_LABEL[data.globalSettings.defaultNotificationFrequency],
            },
            ...counts.map((row) => ({
              key: FREQUENCY_LABEL[row.frequency],
              value: `${row.count} profile${row.count === 1 ? '' : 's'}`,
            })),
          ]}
        />
      )}
    </Widget>
  );
}
