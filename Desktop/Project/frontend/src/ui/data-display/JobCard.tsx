import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { accent, accentDark, framerTransition } from '@/theme';
import { Surface } from '../foundation/Surface';
import { Avatar } from '../foundation/Avatar';
import { Badge } from '../foundation/Badge';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';
import { Skeleton } from '../foundation/Skeleton';

export type JobCardVariant = 'compact' | 'standard' | 'featured';
export type WorkplaceType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface JobCompensation {
  min: number | null;
  max: number | null;
  currency: string;
  period: string;
}

export interface JobCardData {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location?: string | null;
  workplaceType?: WorkplaceType | null;
  /** Already-formatted display label ("Full-time") — enum mapping is a domain-tier concern (Phase 17.7). */
  employmentTypeLabel?: string | null;
  compensation?: JobCompensation | null;
  /** True for the first ~48h — the caller decides the window, not this component. */
  isNew?: boolean;
  /** Preformatted relative time — no date computation here. */
  postedAt?: string;
  skills?: string[];
}

export interface JobCardProps {
  job: JobCardData;
  variant?: JobCardVariant;
  saved?: boolean;
  onSave?: () => void;
  onSelect?: () => void;
  selected?: boolean;
  /** Reserved for the future MatchScore domain component. */
  matchScoreSlot?: ReactNode;
  /** Reserved for the future ProviderBadge domain component. */
  providerBadgeSlot?: ReactNode;
}

const WORKPLACE_LABEL: Record<WorkplaceType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

/** Presentation-level money formatting only — no currency/locale business rules. */
function formatCompensation(c?: JobCompensation | null): string | null {
  if (!c || (c.min == null && c.max == null)) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (c.min != null && c.max != null) return `${fmt(c.min)}–${fmt(c.max)}`;
  if (c.min != null) return `From ${fmt(c.min)}`;
  return `Up to ${fmt(c.max!)}`;
}

const HEIGHT: Record<JobCardVariant, number> = { compact: 72, standard: 88, featured: 96 };

/**
 * The flagship list item (Phase 16.2/16.4). Composes existing tiers only —
 * CompanyLogo/WorkplaceBadge/EmploymentTypeBadge/SalaryDisplay are Phase
 * 16.4's domain-tier plan, but domain is Phase 17.7 and doesn't exist yet;
 * every visual piece here is built directly from foundation (Avatar,
 * Badge, Icon) so the card is fully functional now. When the domain tier
 * lands, JobCard can adopt those primitives for the exact same visuals —
 * this is a forward-compatible stand-in, not a dead end.
 */
export function JobCard({
  job,
  variant = 'standard',
  saved = false,
  onSave,
  onSelect,
  selected = false,
  matchScoreSlot,
  providerBadgeSlot,
}: JobCardProps) {
  const theme = useTheme();
  const a = theme.palette.mode === 'dark' ? accentDark : accent;
  const compensationText = formatCompensation(job.compensation);
  const featured = variant === 'featured';

  return (
    <Surface level={featured ? 'raised' : 'flat'} interactive={Boolean(onSelect)} padding={0}>
      <Box
        onClick={onSelect}
        data-variant={variant}
        data-state={selected ? 'selected' : undefined}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minHeight: HEIGHT[variant],
          px: 4,
          py: 2,
          cursor: onSelect ? 'pointer' : 'default',
          borderLeft: featured ? `3px solid ${a[500]}` : 'none',
          backgroundColor: featured ? a[50] : 'transparent',
          ...(selected && { backgroundColor: a[50] }),
        }}
      >
        <Avatar
          name={job.companyName}
          src={job.companyLogoUrl}
          size={variant === 'compact' ? 24 : 40}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="textMd" truncate={1}>
              {job.title}
            </Typography>
            {providerBadgeSlot}
          </Box>
          <Typography variant="textSm" color="secondary" truncate={1}>
            {job.companyName}
            {job.location ? ` · ${job.location}` : ''}
          </Typography>

          {variant !== 'compact' && (
            <Box
              sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}
            >
              {job.workplaceType && (
                <Badge tone={job.workplaceType === 'REMOTE' ? 'accent' : 'neutral'}>
                  {WORKPLACE_LABEL[job.workplaceType]}
                </Badge>
              )}
              {job.employmentTypeLabel && <Badge tone="neutral">{job.employmentTypeLabel}</Badge>}
              {job.isNew && <Badge tone="accent">New</Badge>}
              {matchScoreSlot}
              {variant === 'featured' &&
                job.skills?.slice(0, 4).map((skill) => (
                  <Badge key={skill} tone="neutral">
                    {skill}
                  </Badge>
                ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
            flexShrink: 0,
          }}
        >
          {compensationText && (
            <Typography variant="textSm" tabularNums as="span">
              {compensationText}
            </Typography>
          )}
          {job.postedAt && (
            <Typography variant="textXs" color="secondary" as="span">
              {job.postedAt}
            </Typography>
          )}
        </Box>

        {onSave && (
          <IconButton
            aria-label={
              saved
                ? `Unsave ${job.title} at ${job.companyName}`
                : `Save ${job.title} at ${job.companyName}`
            }
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            sx={{ flexShrink: 0, color: saved ? a[500] : 'text.secondary' }}
          >
            <motion.span
              key={String(saved)}
              initial={{ scale: saved ? 1 : 0.8 }}
              animate={{ scale: 1 }}
              transition={framerTransition.spring}
              style={{ display: 'inline-flex' }}
            >
              <Icon name="bookmark" size={16} />
            </motion.span>
          </IconButton>
        )}
      </Box>
    </Surface>
  );
}

export interface JobCardSkeletonProps {
  variant?: JobCardVariant;
}

function JobCardSkeleton({ variant = 'standard' }: JobCardSkeletonProps) {
  return (
    <Surface level="flat" padding={0}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minHeight: HEIGHT[variant],
          px: 4,
          py: 2,
        }}
      >
        <Skeleton
          shape="circle"
          width={variant === 'compact' ? 24 : 40}
          height={variant === 'compact' ? 24 : 40}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton shape="text" width="55%" />
          <Skeleton shape="text" width="35%" />
        </Box>
        <Skeleton shape="text" width={60} />
      </Box>
    </Surface>
  );
}

JobCard.Skeleton = JobCardSkeleton;
