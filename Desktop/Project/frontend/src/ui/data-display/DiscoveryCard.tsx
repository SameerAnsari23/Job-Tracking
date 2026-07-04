import { useState } from 'react';
import type { ElementType } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { Card } from '../layout/Card';
import { Badge } from '../foundation/Badge';
import type { BadgeTone } from '../foundation/Badge';
import { Chip } from '../foundation/Chip';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export type DiscoveryPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DiscoveryCardProps {
  label: string;
  active: boolean;
  priority?: DiscoveryPriority;
  watchedCompanies: string[];
  /** Preformatted display string ("Daily digest") — no scheduling logic here. */
  notificationFrequency?: string;
  /** Preformatted relative time — no date computation here. */
  lastExecution?: string;
  onPause?: () => void;
  onResume?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /**
   * Semantic heading level for `label` — visual size (h6) stays fixed via
   * Typography's own variant/as decoupling; only the DOCUMENT heading level
   * changes. Defaults to h6 (this component's original behavior). Pass the
   * level that keeps this card's actual heading order valid wherever it's
   * composed — e.g. "h4" directly under a page's h3 section title.
   */
  titleAs?: ElementType;
}

const PRIORITY_TONE: Record<DiscoveryPriority, BadgeTone> = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'neutral',
};

/**
 * Discovery profile summary (Phase 16.3 §1.5): status/priority badges,
 * watchlist preview with expandable "+N more", last-execution line, and
 * a pause/resume/edit/delete action row. Paused profiles render at 70%
 * opacity per the design spec.
 */
export function DiscoveryCard({
  label,
  active,
  priority,
  watchedCompanies,
  notificationFrequency,
  lastExecution,
  onPause,
  onResume,
  onEdit,
  onDelete,
  titleAs,
}: DiscoveryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleCompanies = expanded ? watchedCompanies : watchedCompanies.slice(0, 3);
  const hiddenCount = watchedCompanies.length - visibleCompanies.length;

  return (
    <Card>
      <Box sx={{ opacity: active ? 1 : 0.7, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}
        >
          <Typography variant="h6" as={titleAs} truncate={1}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Paused'}</Badge>
            {priority && <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="labelXs" color="secondary">
            Watching {watchedCompanies.length} compan{watchedCompanies.length === 1 ? 'y' : 'ies'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {visibleCompanies.map((company) => (
              <Chip key={company} label={company} />
            ))}
            {hiddenCount > 0 && (
              <ButtonBase
                onClick={() => setExpanded(true)}
                sx={{ fontSize: 12, color: 'text.secondary', px: 1 }}
              >
                +{hiddenCount} more
              </ButtonBase>
            )}
          </Box>
        </Box>

        {(notificationFrequency || lastExecution) && (
          <Box sx={{ display: 'flex', gap: 4 }}>
            {notificationFrequency && (
              <Typography variant="textSm" color="secondary">
                {notificationFrequency}
              </Typography>
            )}
            {lastExecution && (
              <Typography variant="textSm" color="secondary">
                Last run {lastExecution}
              </Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            mt: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {active && onPause && (
              <ButtonBase onClick={onPause} sx={actionSx}>
                <Icon name="pause" size={14} /> Pause
              </ButtonBase>
            )}
            {!active && onResume && (
              <ButtonBase onClick={onResume} sx={actionSx}>
                <Icon name="play" size={14} /> Resume
              </ButtonBase>
            )}
            {onEdit && (
              <ButtonBase onClick={onEdit} sx={actionSx}>
                <Icon name="edit" size={14} /> Edit
              </ButtonBase>
            )}
          </Box>
          {onDelete && (
            <ButtonBase onClick={onDelete} sx={{ ...actionSx, color: 'error.main' }}>
              <Icon name="trash" size={14} /> Delete
            </ButtonBase>
          )}
        </Box>
      </Box>
    </Card>
  );
}

const actionSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  fontSize: 13,
  color: 'text.secondary',
  px: 1,
  borderRadius: 1,
} as const;
