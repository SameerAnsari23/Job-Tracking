import Box from '@mui/material/Box';
import { PageHeader } from '@/ui/navigation/PageHeader';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { useAuthStore } from '@/shared/stores/authStore';
import { KpiGrid } from '../components/KpiGrid';
import { OnboardingProgressWidget } from '../components/OnboardingProgressWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { DiscoverySummaryWidget } from '../components/DiscoverySummaryWidget';
import { NotificationSummaryWidget } from '../components/NotificationSummaryWidget';
import { QuickActionsWidget } from '../components/QuickActionsWidget';

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * The Dashboard (Phase 18.2) — renders inside the existing AppLayout Outlet
 * (Phase 18.1); it owns no shell chrome of its own. Every widget below is
 * an independent unit with its own query, its own loading/error/empty
 * handling — no shared "dashboard data" object, no fabricated content.
 */
export function DashboardPage() {
  const email = useAuthStore((s) => s.user?.email);
  const greeting = greetingForHour(new Date().getHours());

  return (
    <Stack gap={10}>
      <PageHeader
        title="Dashboard"
        description={email ? `${greeting}, ${email}.` : `${greeting}.`}
      />

      <Stack gap={4}>
        {/* Visually a small label, semantically h2 — every Widget below
            renders its own title as h3 (Widget.tsx), so the page needs
            exactly one h2 between that and the h1 above to keep the
            heading order valid (Typography decouples visual size from
            semantic level for exactly this case). */}
        <Typography variant="h6" as="h2">
          Overview
        </Typography>
        <KpiGrid />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 6,
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          alignItems: 'start',
        }}
      >
        <Stack gap={6}>
          <RecentActivityWidget />
          <DiscoverySummaryWidget />
        </Stack>
        <Stack gap={6}>
          <OnboardingProgressWidget />
          <NotificationSummaryWidget />
          <QuickActionsWidget />
        </Stack>
      </Box>
    </Stack>
  );
}
