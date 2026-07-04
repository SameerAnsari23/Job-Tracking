import { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  semanticLight,
  semanticDark,
  surfacesLight,
  surfacesDark,
  duration,
  easing,
} from '@/theme';
import { Icon } from './Icon';

export type AvatarSize = 24 | 30 | 32 | 40 | 48 | 80;

export interface AvatarProps {
  src?: string | null;
  /** Used for initials fallback and as the accessible name. */
  name?: string;
  size?: AvatarSize;
  /** Online presence dot (bottom-right, success color, surface ring). */
  status?: 'online' | null;
  /**
   * Fallback palette: 'accent' (default — people) or 'neutral' (company
   * logos, per the domain-tier CompanyLogo spec). Purely a color choice —
   * the fallback chain and every other behavior is identical.
   */
  tone?: 'accent' | 'neutral';
}

const FONT_SIZE: Record<AvatarSize, number> = { 24: 10, 30: 12, 32: 12, 40: 16, 48: 18, 80: 28 };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Identity mark with the Phase 16.4 fallback chain: image → initials on
 * accent-100 (or neutral-100 via `tone="neutral"`) → generic user icon.
 * Never a broken-image glyph; images fade in on load. The domain-tier
 * CompanyLogo is a thin `tone="neutral"` specialization of this component.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size = 30, status = null, tone = 'accent' },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const a = dark ? accentDark : accent;
  const n = dark ? neutralDark : neutralLight;
  const s = dark ? semanticDark : semanticLight;
  const surf = dark ? surfacesDark : surfacesLight;
  const fallbackBg = tone === 'neutral' ? n[100] : a[100];
  const fallbackFg = tone === 'neutral' ? n[600] : a[700];

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(src) && !failed;
  const initials = name ? initialsOf(name) : '';

  return (
    <Box
      ref={ref}
      component="span"
      role="img"
      aria-label={name ?? 'User avatar'}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: fallbackBg,
          color: fallbackFg,
          fontSize: FONT_SIZE[size],
          fontWeight: 600,
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        {showImage ? (
          <Box
            component="img"
            src={src ?? undefined}
            alt=""
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transition: `opacity ${duration.fast}ms ${easing.easeOut}`,
            }}
          />
        ) : initials ? (
          initials
        ) : (
          <Icon name="user" size={size >= 40 ? 20 : 14} />
        )}
      </Box>
      {status === 'online' && (
        <Box
          component="span"
          aria-label="Online"
          role="status"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.max(8, size / 5),
            height: Math.max(8, size / 5),
            borderRadius: '50%',
            backgroundColor: s.successText,
            border: `2px solid ${surf.surface}`,
          }}
        />
      )}
    </Box>
  );
});
