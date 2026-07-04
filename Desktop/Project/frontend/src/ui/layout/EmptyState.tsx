import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark } from '@/theme';
import { Typography } from '../foundation/Typography';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Stack } from './Stack';

export interface EmptyStateProps {
  /**
   * Illustration slot. Until the 8-piece line-art family ships, the `icon`
   * shorthand renders the placeholder treatment (large icon in a soft
   * accent circle) — same geometry, swappable later without layout shift.
   */
  illustration?: ReactNode;
  icon?: IconName;
  title: string;
  /** One line (Phase 16.3 rule) — say what's true and what to do next. */
  description?: string;
  /** ONE primary next action (or a chip row). Never more than one CTA. */
  action?: ReactNode;
}

/**
 * Empty-state composition (Phase 16.3 §3.3): illustration + headline +
 * one-line body + single action, centered, generous padding.
 */
export function EmptyState({
  illustration,
  icon = 'search',
  title,
  description,
  action,
}: EmptyStateProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const a = dark ? accentDark : accent;
  const n = dark ? neutralDark : neutralLight;

  return (
    <Stack gap={4} align="center">
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        {illustration ?? (
          <Box
            aria-hidden
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: a[50],
              color: n[400],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={24} />
          </Box>
        )}
        <Stack gap={2} align="center">
          <Typography variant="h5" as="p">
            {title}
          </Typography>
          {description && (
            <Typography variant="textSm" color="secondary">
              {description}
            </Typography>
          )}
        </Stack>
        {action}
      </Box>
    </Stack>
  );
}
