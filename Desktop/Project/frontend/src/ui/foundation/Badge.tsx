import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  semanticLight,
  semanticDark,
  radius,
  typeScale,
} from '@/theme';
import { warnDev } from '../internal/dev';

export type BadgeTone = 'success' | 'warning' | 'error' | 'neutral' | 'accent';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Dot-only mode (8px circle) — requires srLabel. */
  dot?: boolean;
  /** Screen-reader text; auto-composed as "Status: {children}" when omitted. */
  srLabel?: string;
  children?: string;
}

/**
 * Non-interactive status token (Phase 16.2 badge table): subtle background,
 * semantic text, hairline border, label-xs uppercase. Status is never
 * carried by color alone — the text (or srLabel for dots) always names it.
 */
export function Badge({ tone = 'neutral', dot = false, srLabel, children }: BadgeProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const s = dark ? semanticDark : semanticLight;

  const tones: Record<BadgeTone, { bg: string; text: string; border: string }> = {
    success: { bg: s.successSubtle, text: s.successText, border: s.successBorder },
    warning: { bg: s.warningSubtle, text: s.warningText, border: s.warningBorder },
    error: { bg: s.errorSubtle, text: s.errorText, border: s.errorBorder },
    neutral: { bg: n[100], text: n[600], border: n[200] },
    accent: { bg: a[50], text: a[600], border: a[200] },
  };
  const c = tones[tone];

  warnDev(dot && !srLabel, '[Badge] dot-only badges require srLabel (Phase 16.4 G2).');

  if (dot) {
    return (
      <Box
        component="span"
        aria-label={srLabel}
        role={srLabel ? 'img' : undefined}
        sx={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: c.text,
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Box
      component="span"
      aria-label={srLabel ?? (children ? `Status: ${children}` : undefined)}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        px: 2,
        borderRadius: `${radius.sm}px`,
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        ...typeScale.labelXs,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}
