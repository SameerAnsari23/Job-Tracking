import Box from '@mui/material/Box';
import { PageHeader } from '@/ui/navigation/PageHeader';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { OnboardingGuidance } from '../components/OnboardingGuidance';
import { DiscoveryStatusWidget } from '../components/DiscoveryStatusWidget';
import { DiscoveryProfilesWidget } from '../components/DiscoveryProfilesWidget';
import { DiscoveryActivityWidget } from '../components/DiscoveryActivityWidget';
import { WatchedCompaniesWidget } from '../components/WatchedCompaniesWidget';
import { AutomationSummaryWidget } from '../components/AutomationSummaryWidget';
import { ScheduleSummaryWidget } from '../components/ScheduleSummaryWidget';
import { QuickActionsWidget } from '../components/QuickActionsWidget';

/**
 * The Discovery feature (Phase 18.3) — renders inside the existing
 * AppLayout Outlet (Phase 18.1); it owns no shell chrome of its own. Every
 * widget below reads the same shared /discovery query (the backend has
 * exactly one endpoint for profiles/companies/settings) except Discovery
 * Activity, which is genuinely independent (a separate endpoint,
 * /jobs/recommendations) — see each widget's own hook for why.
 */
export function DiscoveryPage() {
  return (
    <Stack gap={10}>
      <PageHeader
        title="Discovery"
        description="Automated matching across every company and role you watch."
      />

      <OnboardingGuidance />

      <Stack gap={4}>
        {/* One h2 between the page's h1 and every Widget's own h3 title
            (Widget.tsx) keeps the heading order valid — see Dashboard's
            DashboardPage.tsx for the same fix and rationale. */}
        <Typography variant="h6" as="h2">
          Overview
        </Typography>
        <DiscoveryStatusWidget />
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
          <DiscoveryProfilesWidget />
          <DiscoveryActivityWidget />
        </Stack>
        <Stack gap={6}>
          <WatchedCompaniesWidget />
          <AutomationSummaryWidget />
          <ScheduleSummaryWidget />
          <QuickActionsWidget />
        </Stack>
      </Box>
    </Stack>
  );
}
