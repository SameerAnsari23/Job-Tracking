/**
 * Typography tokens — the 11-step scale from Phase 16.2 §2.2.
 *
 * The MUI theme maps the built-in variants (h1–h6, body1/2, caption,
 * subtitle1/2, overline) onto this scale; the ui/ Typography primitive
 * (blueprint Phase C) consumes `typeScale` directly for the full set.
 */
import type { CSSProperties } from 'react';

export const fontFamilySans = [
  '"Inter Variable"',
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'sans-serif',
].join(', ');

export const fontFamilyMono = [
  '"JetBrains Mono"',
  '"Fira Code"',
  '"Cascadia Code"',
  'ui-monospace',
  'monospace',
].join(', ');

export interface TypeStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing: string;
  textTransform?: CSSProperties['textTransform'];
}

export const typeScale = {
  textXs: { fontSize: '11px', lineHeight: '16px', fontWeight: 400, letterSpacing: '0.02em' },
  textSm: { fontSize: '13px', lineHeight: '20px', fontWeight: 400, letterSpacing: '0' },
  textBase: { fontSize: '15px', lineHeight: '24px', fontWeight: 400, letterSpacing: '0' },
  textMd: { fontSize: '16px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0' },
  labelXs: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  labelSm: { fontSize: '12px', lineHeight: '16px', fontWeight: 500, letterSpacing: '0.04em' },
  h6: { fontSize: '14px', lineHeight: '20px', fontWeight: 600, letterSpacing: '-0.01em' },
  h5: { fontSize: '16px', lineHeight: '24px', fontWeight: 600, letterSpacing: '-0.01em' },
  h4: { fontSize: '20px', lineHeight: '28px', fontWeight: 600, letterSpacing: '-0.02em' },
  h3: { fontSize: '24px', lineHeight: '32px', fontWeight: 700, letterSpacing: '-0.02em' },
  h2: { fontSize: '30px', lineHeight: '38px', fontWeight: 700, letterSpacing: '-0.03em' },
  h1: { fontSize: '38px', lineHeight: '46px', fontWeight: 700, letterSpacing: '-0.03em' },
} as const satisfies Record<string, TypeStyle>;

/**
 * Responsive heading downscale on mobile (Phase 16.2 §5):
 * h1 38→28, h2 30→24, h3 24→20. Body and labels never scale.
 */
export const mobileHeadingScale = {
  h1: { fontSize: '28px', lineHeight: '36px' },
  h2: { fontSize: '24px', lineHeight: '32px' },
  h3: { fontSize: '20px', lineHeight: '28px' },
} as const;

/** Apply to any numeric column, stat value, or timestamp column. */
export const tabularNums: CSSProperties = { fontVariantNumeric: 'tabular-nums' };
