import Box from '@mui/material/Box';
import { StatisticCard } from '@/ui/data-display/StatisticCard';
import { useProfileSummary } from '../hooks/useProfileSummary';
import { useSavedJobsCount } from '../hooks/useSavedJobsCount';
import { useDiscoverySummary } from '../hooks/useDiscoverySummary';
import { useNotificationsSummary } from '../hooks/useNotificationsSummary';

/**
 * Four independent queries, one per tile — a failure or slow response on
 * any single metric never blocks the other three (Phase 18.2 "widget
 * independence"). Each tile falls back to an honest "—" on error rather
 * than a fabricated zero.
 */
export function KpiGrid() {
  const profile = useProfileSummary();
  const savedJobs = useSavedJobsCount();
  const discovery = useDiscoverySummary();
  const notifications = useNotificationsSummary();

  const activeDiscoveryProfiles = discovery.data?.profiles.filter((p) => p.isActive).length;
  const unreadCount = notifications.data?.filter((n) => !n.isRead).length;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 6,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
      }}
    >
      <StatisticCard
        label="Profile Completion"
        value={profile.isError ? '—' : `${profile.data?.completionScore ?? 0}%`}
        icon="user"
        href="/profile"
        loading={profile.isLoading}
      />
      <StatisticCard
        label="Saved Jobs"
        value={
          savedJobs.isError
            ? '—'
            : `${savedJobs.data?.items.length ?? 0}${savedJobs.data?.hasMore ? '+' : ''}`
        }
        icon="bookmark"
        href="/jobs/saved"
        loading={savedJobs.isLoading}
      />
      <StatisticCard
        label="Discovery Profiles"
        value={
          discovery.isError ? '—' : `${activeDiscoveryProfiles ?? 0}/${discovery.data?.profiles.length ?? 0}`
        }
        icon="radar"
        href="/discovery"
        loading={discovery.isLoading}
      />
      <StatisticCard
        label="Unread Notifications"
        value={notifications.isError ? '—' : (unreadCount ?? 0)}
        icon="bell"
        href="/notifications"
        loading={notifications.isLoading}
      />
    </Box>
  );
}

