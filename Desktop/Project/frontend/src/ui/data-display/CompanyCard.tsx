import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Card } from '../layout/Card';
import { Avatar } from '../foundation/Avatar';
import { Badge } from '../foundation/Badge';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export type HiringStatus = 'actively-hiring' | 'selectively-hiring' | 'not-hiring';

export interface CompanyCardProps {
  name: string;
  logoUrl?: string | null;
  /** 0–5; omit to hide the rating row entirely. */
  rating?: number;
  hiringStatus?: HiringStatus;
  openPositions?: number;
  description?: string;
  /** Rendered bottom-right — typically a Follow/Unfollow Button. */
  followSlot?: ReactNode;
  href?: string;
}

const HIRING_LABEL: Record<HiringStatus, string> = {
  'actively-hiring': 'Actively hiring',
  'selectively-hiring': 'Selectively hiring',
  'not-hiring': 'Not hiring',
};
const HIRING_TONE: Record<HiringStatus, 'success' | 'warning' | 'neutral'> = {
  'actively-hiring': 'success',
  'selectively-hiring': 'warning',
  'not-hiring': 'neutral',
};

/** Read-only 0–5 star rating row — no input behavior, just a display. */
function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <Box role="img" aria-label={`${value} out of 5 stars`} sx={{ display: 'flex', gap: 0.5 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} sx={{ color: i < rounded ? 'warning.main' : 'text.disabled' }}>
          <Icon name="star" size={14} />
        </Box>
      ))}
    </Box>
  );
}

/** Company summary card (Phase 16.4): logo, rating, hiring status, description, follow slot. */
export function CompanyCard({
  name,
  logoUrl,
  rating,
  hiringStatus,
  openPositions,
  description,
  followSlot,
  href,
}: CompanyCardProps) {
  return (
    <Card interactive={Boolean(href)} href={href} aria-label={href ? name : undefined}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Avatar name={name} src={logoUrl} size={40} />
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}
          >
            <Typography variant="h6" truncate={1}>
              {name}
            </Typography>
            {rating !== undefined && <StarRating value={rating} />}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {hiringStatus && (
              <Badge tone={HIRING_TONE[hiringStatus]}>{HIRING_LABEL[hiringStatus]}</Badge>
            )}
            {openPositions !== undefined && (
              <Typography variant="textSm" color="secondary" tabularNums>
                {openPositions} open role{openPositions === 1 ? '' : 's'}
              </Typography>
            )}
          </Box>

          {description && (
            <Typography variant="textSm" color="secondary" truncate={2}>
              {description}
            </Typography>
          )}

          {followSlot && (
            <Box sx={{ position: 'relative', zIndex: 1, alignSelf: 'flex-start', mt: 1 }}>
              {followSlot}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
