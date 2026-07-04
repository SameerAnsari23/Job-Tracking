import Box from '@mui/material/Box';
import { Section } from '@/ui/layout/Section';
import { LoadingState } from '@/ui/layout/LoadingState';
import { ErrorState } from '@/ui/layout/ErrorState';
import { StatisticCard } from '@/ui/data-display/StatisticCard';
import { KeyValue } from '@/ui/data-display/KeyValue';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';
import { PRIORITY_LABEL, REMOTE_PREFERENCE_LABEL } from './internal/discoveryLabels';

/**
 * "Automation status" here means the real on/off configuration state — the
 * backend has no execution telemetry (no worker ever confirms a profile
 * actually ran), so this never claims otherwise.
 *
 * Uses Section, not Widget: StatisticCard always renders its own raised
 * Card internally, and Widget's chrome is ALSO a raised Surface — nesting
 * one inside the other trips the design system's own
 * raised-inside-raised rule (Phase 16.2). Section gives the same title
 * treatment without a competing Surface.
 */
export function AutomationSummaryWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryPreferences();

  const activeCount = data?.profiles.filter((p) => p.isActive).length ?? 0;
  const totalCount = data?.profiles.length ?? 0;

  return (
    <Section title="Automation Status" titleAs="h3">
      {isLoading ? (
        <LoadingState layout="grid" count={2} label="Loading Automation Status" />
      ) : isError ? (
        <ErrorState
          compact
          title={(error as Error).message || 'Could not load automation status.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        data && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: '1fr 1fr' }}>
              <StatisticCard
                label="Global Discovery"
                value={data.isActive ? 'On' : 'Off'}
                icon="gauge"
              />
              <StatisticCard
                label="Active Profiles"
                value={`${activeCount}/${totalCount}`}
                icon="radar"
              />
            </Box>
            <KeyValue
              pairs={[
                {
                  key: 'Default remote preference',
                  value: REMOTE_PREFERENCE_LABEL[data.globalSettings.defaultRemotePreference],
                },
                {
                  key: 'Default priority',
                  value: PRIORITY_LABEL[data.globalSettings.defaultPriority],
                },
              ]}
            />
          </Box>
        )
      )}
    </Section>
  );
}
