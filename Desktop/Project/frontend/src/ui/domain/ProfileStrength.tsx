import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Progress } from '../foundation/Progress';
import { Icon } from '../foundation/Icon';
import { Typography } from '../foundation/Typography';

export interface ProfileStrengthChecklistItem {
  label: string;
  done: boolean;
}

export interface ProfileStrengthProps {
  /** 0–100 — computed by the feature layer (headline/skills/experience weights live there, not here). */
  score: number;
  checklist?: ProfileStrengthChecklistItem[];
  /** e.g. a Link to the highest-value missing section. */
  recommendationsSlot?: ReactNode;
}

/**
 * Profile completion module (Phase 16.3/16.4): progress bar (success tone
 * at 100%) plus an optional checklist and a recommendations slot. The
 * score computation and "which section is missing" logic both live in the
 * feature layer — this component only renders what it's given.
 */
export function ProfileStrength({ score, checklist, recommendationsSlot }: ProfileStrengthProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const complete = clamped >= 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        <Typography variant="textSm" color="secondary">
          Profile strength
        </Typography>
        <Typography variant="textSm" tabularNums color={complete ? 'success' : 'secondary'}>
          {clamped}%
        </Typography>
      </Box>
      <Progress
        value={clamped}
        tone={complete ? 'success' : 'accent'}
        animateOnMount
        aria-label="Profile completion"
      />

      {checklist && checklist.length > 0 && (
        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {checklist.map((item) => (
            <Box
              key={item.label}
              component="li"
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  color: item.done ? 'success.main' : 'text.disabled',
                }}
              >
                <Icon name={item.done ? 'check' : 'clock'} size={14} />
              </Box>
              <Typography variant="textSm" color={item.done ? 'secondary' : 'primary'} as="span">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {recommendationsSlot}
    </Box>
  );
}
