/**
 * Color tokens — verbatim from Phase 16.2 §2.1.
 *
 * Rationale: indigo-violet accent (#5B5BD6), neutrals with a faint cool cast
 * (hue ~235°) so greys read as chosen, teal success (not green). The sidebar
 * is ALWAYS dark in both themes — the product's visual signature.
 */

// ── Accent scale ──────────────────────────────────────────────────────────────

export const accent = {
  50: '#EEEEFC',
  100: '#DCDCF8',
  200: '#BCBCF0',
  500: '#5B5BD6',
  600: '#4A4AB8',
  700: '#3939A0',
  foreground: '#FFFFFF',
} as const;

export const accentDark = {
  50: '#1A1A3A',
  100: '#22224A',
  200: '#2E2E60',
  500: '#7B7BDE',
  600: '#6868CA',
  700: '#5555B6',
  // Measured correction to the Phase 16.2 table: white on #7B7BDE is only
  // 3.66:1 (the table claimed 6.4:1). The dark accent is intentionally
  // lighter, so dark-mode primary buttons use ink text — 5.4:1 AA.
  foreground: '#0A0A10',
} as const;

// ── Neutral scale (hue ~235°) ────────────────────────────────────────────────

export const neutralLight = {
  0: '#FFFFFF',
  50: '#F7F7FC',
  100: '#EFEFF8',
  150: '#E8E8F4',
  200: '#DFDFF0',
  300: '#C8C8E0',
  400: '#9898B8',
  500: '#6B6B88',
  600: '#484865',
  700: '#2E2E50',
  800: '#1A1A38',
  900: '#0D0D20',
} as const;

export const neutralDark = {
  0: '#0A0A10',
  50: '#0F0F18',
  100: '#141420',
  150: '#1A1A28',
  200: '#20202F',
  300: '#2C2C40',
  400: '#454560',
  500: '#6868A0',
  600: '#9090BC',
  700: '#B8B8D8',
  800: '#D8D8EE',
  900: '#F0F0FA',
} as const;

// ── Semantic families ────────────────────────────────────────────────────────

export const semanticLight = {
  successSubtle: '#F0FAFA',
  successText: '#0D7A70',
  successBorder: '#99DDD6',
  warningSubtle: '#FEFAF0',
  warningText: '#92590A',
  warningBorder: '#F5CE7A',
  errorSubtle: '#FFF0F0',
  errorText: '#B91C1C',
  errorBorder: '#FDA5A5',
  infoSubtle: '#F0F4FF',
  infoText: '#1E40AF',
} as const;

export const semanticDark = {
  successSubtle: '#051A1A',
  successText: '#2DD4BF',
  successBorder: '#134040',
  warningSubtle: '#1A1400',
  warningText: '#F59E0B',
  warningBorder: '#3D2A00',
  errorSubtle: '#1A0505',
  errorText: '#F87171',
  errorBorder: '#3D1515',
  infoSubtle: '#050A1A',
  infoText: '#93C5FD',
} as const;

// ── Backgrounds & surfaces ───────────────────────────────────────────────────

export const surfacesLight = {
  app: '#F7F7FC',
  surface: '#FFFFFF',
  subtle: '#F7F7FC',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export const surfacesDark = {
  app: '#0A0A10',
  surface: '#111119',
  subtle: '#0F0F18',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

// ── Sidebar (always dark — both themes) ──────────────────────────────────────

export const sidebar = {
  /** Sidebar background when the app theme is light. */
  bgLight: '#0F0F17',
  /** Sidebar background when the app theme is dark. */
  bgDark: '#08080E',
  border: '#1E1E2E',
  itemHover: '#1A1A26',
  itemActive: '#22224A',
  textRest: '#8080A0',
  textHover: '#D0D0E8',
  textActive: '#A0A0F0',
  iconRest: '#555580',
  iconHover: '#A0A0C8',
  iconActive: '#7B7BDE',
  sectionLabel: '#44445A',
  activeBar: '#7B7BDE',
  /** Focus ring on the dark rail needs the lighter accent variant. */
  focusRing: '#A0A0F0',
} as const;

// ── Interaction colors ───────────────────────────────────────────────────────

export const interactionLight = {
  hover: neutralLight[150],
  selectedBg: accent[50],
  selectedText: accent[600],
  focusRing: accent[500],
  focusRingSubtle: accent[200],
  selectionBg: accent[100],
} as const;

export const interactionDark = {
  hover: neutralDark[150],
  selectedBg: accentDark[50],
  selectedText: accentDark[500],
  focusRing: accentDark[500],
  focusRingSubtle: accentDark[200],
  selectionBg: accentDark[100],
} as const;

// ── Charts palette (Phase 16.3 §4 dataviz rules — max 3 series) ─────────────

export const chartsLight = {
  series1: accent[500],
  series2: '#2DD4BF',
  series3: '#F59E0B',
  grid: neutralLight[100],
  tickLabel: neutralLight[400],
  areaFillOpacity: 0.1,
} as const;

export const chartsDark = {
  series1: accentDark[500],
  series2: '#2DD4BF',
  series3: '#F59E0B',
  grid: neutralDark[200],
  tickLabel: neutralDark[400],
  areaFillOpacity: 0.1,
} as const;

// ── Top navigation (frosted glass — Phase 16.2 §2.1 topnav row) ─────────────

export const topNav = {
  bgLight: 'rgba(247, 247, 252, 0.85)',
  bgDark: 'rgba(10, 10, 16, 0.85)',
} as const;

// ── Gradients (threshold moments only — Phase 16.3 §4 discipline) ───────────

export const gradients = {
  hero: 'linear-gradient(135deg, #5B5BD6 0%, #9B5BD6 100%)',
  cardShimmer:
    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%)',
  sidebarFade: 'linear-gradient(180deg, transparent 0%, #0F0F17 100%)',
} as const;
