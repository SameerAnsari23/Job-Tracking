import { createContext, forwardRef, useContext } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import {
  neutralLight,
  neutralDark,
  surfacesLight,
  surfacesDark,
  shadowsLight,
  shadowsDark,
  radius,
  duration,
  easing,
} from '@/theme';
import { warnDev } from '../internal/dev';

export type SurfaceLevel = 'flat' | 'raised' | 'inset';

export interface SurfaceProps {
  /** flat: border only · raised: border + shadow (light) · inset: subtle bg, no border. */
  level?: SurfaceLevel;
  /** Hover lift + pointer — for whole-surface click targets. */
  interactive?: boolean;
  /** Padding in 4px grid units (space token index). Default 6 (24px). */
  padding?: number;
  /** Radius token override — default radius-lg (8px), the card standard. */
  radiusPx?: number;
  as?: 'div' | 'section' | 'article' | 'aside';
  children: ReactNode;
}

// Dev-only guard for the Phase 16.2 rule: never nest Raised inside Raised.
const RaisedContext = createContext(false);

/**
 * The card-material primitive (Phase 16.4) underlying Card, Widget, Dialog
 * panels. Light mode: border + shadow together, very subtle. Dark mode:
 * border only — elevation comes from background lightness, never shadow.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { level = 'flat', interactive = false, padding = 6, radiusPx = radius.lg, as = 'div', children },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const surf = dark ? surfacesDark : surfacesLight;
  const sh = dark ? shadowsDark : shadowsLight;

  const insideRaised = useContext(RaisedContext);
  warnDev(
    level === 'raised' && insideRaised,
    '[Surface] Raised surfaces must not nest inside Raised surfaces (Phase 16.2).',
  );

  const base = {
    flat: {
      backgroundColor: surf.surface,
      border: `1px solid ${n[200]}`,
      boxShadow: 'none',
    },
    raised: {
      backgroundColor: surf.surface,
      border: `1px solid ${n[200]}`,
      boxShadow: dark ? 'none' : sh.sm,
    },
    inset: {
      backgroundColor: surf.subtle,
      border: 'none',
      boxShadow: 'none',
    },
  }[level];

  const hover = {
    flat: { backgroundColor: surf.subtle },
    raised: { boxShadow: dark ? 'none' : sh.md, transform: 'translateY(-1px)' },
    inset: { backgroundColor: n[150] },
  }[level];

  const content = (
    <Box
      ref={ref}
      component={as}
      sx={{
        ...base,
        borderRadius: `${radiusPx}px`,
        p: padding,
        ...(interactive
          ? {
              cursor: 'pointer',
              transition: `background-color ${duration.instant}ms ${easing.easeOut}, box-shadow ${duration.instant}ms ${easing.easeOut}, transform ${duration.instant}ms ${easing.easeOut}`,
              '&:hover': hover,
            }
          : {}),
      }}
    >
      {children}
    </Box>
  );

  return level === 'raised' ? (
    <RaisedContext.Provider value={true}>{content}</RaisedContext.Provider>
  ) : (
    content
  );
});
