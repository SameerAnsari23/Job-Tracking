import Box from '@mui/material/Box';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';
import { Tooltip } from '../foundation/Tooltip';
import type { WorkplaceType } from './WorkplaceBadge';

export interface LocationDisplayProps {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  workplaceType?: WorkplaceType | null;
  /** Locations beyond the primary — renders "+N more" with a tooltip listing them. */
  additionalLocations?: string[];
  /** Hides the pin icon and tightens spacing for dense list rows. */
  compact?: boolean;
}

const WORKPLACE_LABEL: Record<WorkplaceType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

/**
 * Location line (Phase 16.4): "San Francisco, CA · Remote". A fully remote
 * job with no office shows "Remote" alone — no location fields are
 * required. Multiple locations collapse to the primary + a "+N more"
 * tooltip rather than wrapping the row.
 */
export function LocationDisplay({
  city,
  region,
  country,
  workplaceType,
  additionalLocations = [],
  compact = false,
}: LocationDisplayProps) {
  const parts = [city, region, country].filter(Boolean);
  const primary = parts.join(', ');
  const workplaceLabel = workplaceType ? WORKPLACE_LABEL[workplaceType] : null;

  const segments = [primary || null, workplaceLabel].filter(Boolean) as string[];
  if (segments.length === 0) return null;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      {!compact && (
        <Box sx={{ color: 'text.disabled', display: 'inline-flex' }}>
          <Icon name="mapPin" size={14} />
        </Box>
      )}
      <Typography variant="textSm" color="secondary" as="span">
        {segments.join(' · ')}
      </Typography>
      {additionalLocations.length > 0 && (
        <Tooltip content={additionalLocations.join(', ')}>
          <Typography variant="textXs" color="secondary" as="span">
            +{additionalLocations.length} more
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
}
