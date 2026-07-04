import Box from '@mui/material/Box';
import { Widget } from '@/ui/layout/Widget';
import { EmptyState } from '@/ui/layout/EmptyState';
import { Chip } from '@/ui/foundation/Chip';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';

/** Deduplicated across every profile — purely derived from real data, no aggregate endpoint needed. */
export function WatchedCompaniesWidget() {
  const { data, isLoading, isError, error, refetch } = useDiscoveryPreferences();

  const companies = data
    ? Array.from(
        new Map(
          data.profiles.flatMap((p) => p.watchedCompanies).map((c) => [c.normalizedName, c.name]),
        ).values(),
      ).sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <Widget
      title={`Watched Companies${data ? ` (${companies.length})` : ''}`}
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load watched companies.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && companies.length === 0}
      emptyState={
        <EmptyState
          icon="building"
          title="No companies watched yet"
          description="Companies you add to a discovery profile appear here."
        />
      }
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {companies.map((name) => (
          <Chip key={name} label={name} />
        ))}
      </Box>
    </Widget>
  );
}
