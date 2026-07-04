import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, radius, fontFamilyMono } from '@/theme';
import { Tooltip } from '../foundation/Tooltip';

export type ProviderId = 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters' | 'workday';

export interface ProviderBadgeProps {
  /** The 5 certified providers, or any other source id — rendered verbatim either way. */
  provider: ProviderId | string;
  /** Reserved for a future per-provider logo mark. */
  icon?: ReactNode;
}

const DISPLAY_NAME: Record<ProviderId, string> = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  ashby: 'Ashby',
  smartrecruiters: 'SmartRecruiters',
  workday: 'Workday',
};

function isKnownProvider(id: string): id is ProviderId {
  return id in DISPLAY_NAME;
}

/**
 * Source attribution (Phase 16.4): mono lowercase provider id in an inset
 * chip, with a tooltip carrying the human-readable name. An id outside the
 * 5 certified providers still renders — sources are data, not a closed
 * enum the UI should reject — with a generic tooltip instead of a crash.
 */
export function ProviderBadge({ provider, icon }: ProviderBadgeProps) {
  const theme = useTheme();
  const n = theme.palette.mode === 'dark' ? neutralDark : neutralLight;
  const displayName = isKnownProvider(provider) ? DISPLAY_NAME[provider] : 'Unrecognized source';

  return (
    <Tooltip content={displayName}>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          height: 20,
          px: 2,
          borderRadius: `${radius.sm}px`,
          backgroundColor: n[100],
          color: n[600],
          border: `1px solid ${n[200]}`,
          fontFamily: fontFamilyMono,
          fontSize: 11,
          lineHeight: '16px',
        }}
      >
        {icon}
        {provider}
      </Box>
    </Tooltip>
  );
}
