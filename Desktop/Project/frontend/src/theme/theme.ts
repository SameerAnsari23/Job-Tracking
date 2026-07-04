import { createTheme } from '@mui/material/styles';
import type { Theme, Shadows } from '@mui/material/styles';

import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  semanticLight,
  semanticDark,
  surfacesLight,
  surfacesDark,
  interactionLight,
  interactionDark,
} from './colors';
import { fontFamilySans, typeScale, mobileHeadingScale } from './typography';
import { SPACING_UNIT } from './spacing';
import { radius } from './radius';
import { shadowsLight, shadowsDark } from './shadows';
import { duration, easing } from './motion';
import { muiZIndex } from './zIndex';
import { opacity } from './opacity';
import { mobileMediaQuery } from './breakpoints';
import { breakpointValues } from './breakpoints';

/**
 * The production theme (Phase 16.2) — light and dark generated from one
 * token map. Every override below removes a piece of default Material
 * appearance and replaces it with the finalized product identity:
 * no ripples, no ALL-CAPS buttons, no heavy elevation, radius-md controls
 * on radius-lg surfaces, exponential ease-out everywhere.
 */
export function buildTheme(mode: 'light' | 'dark'): Theme {
  const n = mode === 'light' ? neutralLight : neutralDark;
  const a = mode === 'light' ? accent : accentDark;
  const s = mode === 'light' ? semanticLight : semanticDark;
  const surf = mode === 'light' ? surfacesLight : surfacesDark;
  const ix = mode === 'light' ? interactionLight : interactionDark;
  const sh = mode === 'light' ? shadowsLight : shadowsDark;

  // MUI's 25-step elevation collapsed onto the 5-token scale so any
  // component using `elevation` still lands on product shadows.
  const muiShadows: Shadows = [
    'none',
    sh.xs,
    sh.sm === 'none' ? sh.xs : sh.sm,
    sh.md,
    sh.lg,
    ...Array<string>(20).fill(sh.xl),
  ] as Shadows;

  const transitionFast = `${duration.fast}ms ${easing.easeOut}`;

  return createTheme({
    breakpoints: { values: breakpointValues },
    spacing: SPACING_UNIT,
    shape: { borderRadius: radius.lg },
    shadows: muiShadows,
    zIndex: muiZIndex,

    palette: {
      mode,
      primary: { main: a[500], dark: a[700], light: a[200], contrastText: a.foreground },
      // "Secondary" actions are neutral-surfaced in this system (Phase 16.2
      // button spec) — mapped so palette consumers stay coherent.
      secondary: { main: n[600], contrastText: n[0] },
      background: { default: surf.app, paper: surf.surface },
      text: {
        primary: n[800],
        // Dark neutral-500 fails AA on dark surfaces (3.7:1 measured) —
        // dark mode uses neutral-600 for secondary text (6.2:1).
        secondary: mode === 'light' ? n[500] : n[600],
        disabled: n[400],
      },
      divider: n[200],
      success: { main: s.successText },
      warning: { main: s.warningText },
      error: { main: s.errorText },
      info: { main: s.infoText },
      action: {
        hover: ix.hover,
        selected: ix.selectedBg,
        disabledOpacity: opacity.disabled,
        focus: ix.focusRingSubtle,
      },
    },

    typography: {
      fontFamily: fontFamilySans,
      fontSize: 15,
      h1: { ...typeScale.h1, [mobileMediaQuery]: mobileHeadingScale.h1 },
      h2: { ...typeScale.h2, [mobileMediaQuery]: mobileHeadingScale.h2 },
      h3: { ...typeScale.h3, [mobileMediaQuery]: mobileHeadingScale.h3 },
      h4: typeScale.h4,
      h5: typeScale.h5,
      h6: typeScale.h6,
      body1: typeScale.textBase,
      body2: typeScale.textSm,
      subtitle1: typeScale.textMd,
      subtitle2: typeScale.labelSm,
      caption: typeScale.textXs,
      overline: typeScale.labelXs,
      button: { ...typeScale.textBase, fontWeight: 500, textTransform: 'none' },
    },

    transitions: {
      duration: {
        shortest: duration.instant,
        shorter: duration.fast,
        short: duration.base,
        standard: duration.base,
        complex: duration.slow,
        enteringScreen: duration.base,
        leavingScreen: duration.fast,
      },
      easing: {
        easeInOut: easing.standard,
        easeOut: easing.easeOut,
        easeIn: easing.easeOut,
        sharp: easing.easeOut,
      },
    },

    components: {
      // ── Global resets ─────────────────────────────────────────────────────
      MuiButtonBase: { defaultProps: { disableRipple: true } },

      MuiCssBaseline: {
        styleOverrides: {
          ':focus-visible': {
            outline: `2px solid ${ix.focusRing}`,
            outlineOffset: '2px',
          },
          '::selection': { backgroundColor: ix.selectionBg },
          // Reduced motion: every CSS animation/transition collapses.
          // Framer Motion is covered by MotionConfig reducedMotion="user".
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },

      // ── Button (Phase 16.2: 4 variants × 3 sizes, radius-md, no caps) ────
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            fontWeight: 500,
            transition: `background-color ${transitionFast}, transform ${transitionFast}, box-shadow ${transitionFast}`,
            '&:hover': { transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
            '&.Mui-disabled': { opacity: opacity.disabled },
          },
          sizeSmall: { height: 28, padding: '0 10px', fontSize: 13 },
          sizeMedium: { height: 34, padding: '0 14px', fontSize: 15 },
          sizeLarge: { height: 40, padding: '0 18px', fontSize: 16 },
          // Primary
          containedPrimary: {
            backgroundColor: a[500],
            color: a.foreground,
            '&:hover': { backgroundColor: a[600] },
            '&:active': { backgroundColor: a[700] },
            '&.Mui-disabled': { backgroundColor: a[500], color: a.foreground },
          },
          // Destructive
          containedError: {
            backgroundColor: s.errorSubtle,
            color: s.errorText,
            '&:hover': { backgroundColor: s.errorSubtle, filter: 'brightness(0.97)' },
            '&.Mui-disabled': { backgroundColor: s.errorSubtle, color: s.errorText },
          },
          // Secondary — neutral surface, no outline border
          outlined: {
            backgroundColor: n[100],
            color: n[700],
            border: 'none',
            '&:hover': { backgroundColor: n[150], border: 'none' },
            '&:active': { backgroundColor: n[200] },
            '&.Mui-disabled': { backgroundColor: n[100], color: n[700], border: 'none' },
          },
          // Ghost
          text: {
            color: n[600],
            '&:hover': { backgroundColor: n[100] },
            '&.Mui-disabled': { color: n[600] },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            color: n[600],
            transition: `background-color ${transitionFast}`,
            '&:hover': { backgroundColor: n[100] },
            '&.Mui-disabled': { opacity: opacity.disabled },
          },
        },
      },

      // ── Surfaces (Phase 16.2 card spec: border + shadow-sm light; border
      //    only dark; radius-lg; no dark-mode elevation overlay) ────────────
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: n[200] },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            border: `1px solid ${n[200]}`,
            boxShadow: mode === 'light' ? shadowsLight.sm : 'none',
            backgroundImage: 'none',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: radius.xl,
            boxShadow: sh.lg,
            backgroundImage: 'none',
            border: mode === 'dark' ? `1px solid ${n[200]}` : 'none',
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: surf.overlay,
            '&.MuiBackdrop-invisible': { backgroundColor: 'transparent' },
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            boxShadow: sh.xl,
            backgroundImage: 'none',
            border: 'none',
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? n[800] : n[300],
            color: mode === 'light' ? n[0] : n[900],
            fontSize: 12,
            fontWeight: 400,
            lineHeight: '16px',
            padding: '6px 8px',
            borderRadius: radius.md,
          },
          arrow: { color: mode === 'light' ? n[800] : n[300] },
        },
      },

      // ── Tabs — underline style (Phase 16.2) ──────────────────────────────
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40 },
          indicator: { height: 2, backgroundColor: a[500] },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: 15,
            fontWeight: 400,
            minHeight: 40,
            minWidth: 0,
            padding: '8px 0',
            marginRight: 32,
            color: mode === 'light' ? n[500] : n[600],
            '&:hover': { color: n[700] },
            '&.Mui-selected': { fontWeight: 600, color: a[500] },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            height: 24,
            borderRadius: radius.sm,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.04em',
            backgroundColor: n[100],
            color: n[700],
            border: `1px solid ${n[200]}`,
            transition: `background-color ${transitionFast}`,
            '&:hover': { backgroundColor: n[150] },
          },
          label: { padding: '0 10px' },
          sizeSmall: { height: 20, fontSize: 11 },
        },
      },

      MuiBadge: {
        styleOverrides: {
          badge: {
            fontSize: 11,
            fontWeight: 500,
            height: 18,
            minWidth: 18,
            fontVariantNumeric: 'tabular-nums',
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
            boxShadow: sh.md,
            border: `1px solid ${n[200]}`,
            marginTop: 4,
            backgroundImage: 'none',
          },
          list: { padding: '4px' },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            minHeight: 36,
            borderRadius: radius.sm,
            padding: '6px 10px',
            '&:hover': { backgroundColor: n[100] },
            '&.Mui-selected': {
              backgroundColor: ix.selectedBg,
              color: ix.selectedText,
              '&:hover': { backgroundColor: ix.selectedBg },
            },
          },
        },
      },

      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
            boxShadow: sh.md,
            border: `1px solid ${n[200]}`,
            backgroundImage: 'none',
          },
        },
      },

      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? n[800] : n[150],
            color: n[mode === 'light' ? 0 : 900],
            borderRadius: radius.lg,
            boxShadow: sh.md,
            fontSize: 13,
          },
        },
      },

      // ── Inputs (Phase 16.2: radius-md, neutral-300 rest border,
      //    accent border + accent-200 ring on focus) ────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: surf.surface,
            fontSize: 15,
            transition: `box-shadow ${transitionFast}`,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: n[300] },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: n[400] },
            '&.Mui-focused': { boxShadow: `0 0 0 2px ${ix.focusRingSubtle}` },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: a[500],
              borderWidth: 1,
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: s.errorText },
            '&.Mui-disabled': { opacity: opacity.disabled },
          },
          input: {
            padding: '8px 12px',
            height: 24,
            '&::placeholder': { color: n[400], opacity: 1 },
          },
          inputSizeSmall: { padding: '6px 12px' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: 14, fontWeight: 500 },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { fontSize: 11, lineHeight: '16px', marginLeft: 0, marginTop: 4 },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            borderRadius: radius.lg,
            boxShadow: sh.md,
            border: `1px solid ${n[200]}`,
          },
          option: {
            fontSize: 13,
            minHeight: 36,
            borderRadius: radius.sm,
            '&[aria-selected="true"]': {
              backgroundColor: `${ix.selectedBg} !important`,
              color: ix.selectedText,
            },
          },
          listbox: { padding: 4 },
        },
      },

      MuiAccordion: {
        defaultProps: { disableGutters: true, elevation: 0 },
        styleOverrides: {
          root: {
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            '&::before': { display: 'none' },
          },
        },
      },

      MuiSkeleton: {
        styleOverrides: {
          root: { backgroundColor: n[150], borderRadius: radius.sm },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 6,
            borderRadius: radius.full,
            backgroundColor: n[200],
          },
          bar: { borderRadius: radius.full },
        },
      },

      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: {
          root: { color: a[500], fontWeight: 500 },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: n[200] },
        },
      },
    },
  });
}

export const lightTheme = buildTheme('light');
export const darkTheme = buildTheme('dark');
