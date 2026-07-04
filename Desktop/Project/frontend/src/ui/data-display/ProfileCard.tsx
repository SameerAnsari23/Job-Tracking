import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Avatar } from '../foundation/Avatar';
import { Badge } from '../foundation/Badge';
import type { BadgeTone } from '../foundation/Badge';
import { Chip } from '../foundation/Chip';
import { Progress } from '../foundation/Progress';
import { Typography } from '../foundation/Typography';

export interface ProfileCardBadge {
  label: string;
  tone?: BadgeTone;
}

export interface ProfileCardProps {
  name: string;
  title?: string;
  avatarSrc?: string | null;
  /** 0–100 — omit to hide the completion bar entirely. */
  completion?: number;
  skills?: string[];
  badges?: ProfileCardBadge[];
  actions?: ReactNode;
  /** Compact identity summary (TopNav menu header, sidebar user row) vs. the fuller card. */
  compact?: boolean;
}

/**
 * User summary card (Phase 16.2/16.4): avatar + name/title, optional
 * completion bar (Progress reused), skills as non-interactive Chips,
 * status badges, and an actions slot.
 */
export function ProfileCard({
  name,
  title,
  avatarSrc,
  completion,
  skills,
  badges,
  actions,
  compact = false,
}: ProfileCardProps) {
  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: compact ? 'center' : 'flex-start' }}>
      <Avatar name={name} src={avatarSrc} size={compact ? 30 : 40} />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 0 : 2,
        }}
      >
        <Typography variant={compact ? 'textSm' : 'h6'} truncate={1}>
          {name}
        </Typography>
        {title && (
          <Typography variant={compact ? 'textXs' : 'textSm'} color="secondary" truncate={1}>
            {title}
          </Typography>
        )}

        {!compact && badges && badges.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone ?? 'neutral'}>
                {badge.label}
              </Badge>
            ))}
          </Box>
        )}

        {!compact && completion !== undefined && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Progress
              value={completion}
              tone={completion >= 100 ? 'success' : 'accent'}
              aria-label="Profile completion"
            />
            <Typography variant="textXs" color="secondary" tabularNums>
              {completion}% complete
            </Typography>
          </Box>
        )}

        {!compact && skills && skills.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {skills.map((skill) => (
              <Chip key={skill} label={skill} />
            ))}
          </Box>
        )}

        {!compact && actions && <Box sx={{ mt: 1 }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
