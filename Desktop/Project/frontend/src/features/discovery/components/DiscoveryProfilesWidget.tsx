import { useState } from 'react';
import Box from '@mui/material/Box';
import { Widget } from '@/ui/layout/Widget';
import { EmptyState } from '@/ui/layout/EmptyState';
import { Dialog } from '@/ui/layout/Dialog';
import { Button } from '@/ui/foundation/Button';
import { DiscoveryCard } from '@/ui/data-display/DiscoveryCard';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';
import {
  usePauseDiscoveryProfile,
  useResumeDiscoveryProfile,
  useDeleteDiscoveryProfile,
} from '../hooks/useDiscoveryProfileMutations';
import { FREQUENCY_LABEL } from './internal/discoveryLabels';

/**
 * The feature's core surface — reuses DiscoveryCard wholesale, wired to the
 * real pause/resume/delete mutations. No "edit" action: changing a
 * profile's targeting criteria needs a multi-field form the Page Layout
 * spec doesn't call for, so it's left for a future phase rather than
 * half-built here.
 */
export function DiscoveryProfilesWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryPreferences();
  const pause = usePauseDiscoveryProfile();
  const resume = useResumeDiscoveryProfile();
  const remove = useDeleteDiscoveryProfile();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDeleteLabel = data?.profiles.find((p) => p.id === pendingDeleteId)?.label;

  return (
    <Widget
      title="Discovery Profiles"
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load discovery profiles.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && data.profiles.length === 0}
      emptyState={
        <EmptyState
          icon="radar"
          title="No discovery profiles yet"
          description="Discovery profiles automatically watch companies and roles for you."
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data?.profiles.map((profile) => (
          <DiscoveryCard
            key={profile.id}
            label={profile.label}
            active={profile.isActive}
            priority={profile.priority}
            watchedCompanies={profile.watchedCompanies.map((c) => c.name)}
            notificationFrequency={FREQUENCY_LABEL[profile.notificationFrequency]}
            titleAs="h4"
            onPause={profile.isActive ? () => pause.mutate(profile.id) : undefined}
            onResume={!profile.isActive ? () => resume.mutate(profile.id) : undefined}
            onDelete={() => setPendingDeleteId(profile.id)}
          />
        ))}
      </Box>

      <Dialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Delete discovery profile?"
        description={
          pendingDeleteLabel
            ? `"${pendingDeleteLabel}" will stop watching its companies and roles. This can't be undone.`
            : undefined
        }
        actions={
          <>
            <Button variant="ghost" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={remove.isPending}
              onClick={() => {
                if (!pendingDeleteId) return;
                remove.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </Widget>
  );
}
