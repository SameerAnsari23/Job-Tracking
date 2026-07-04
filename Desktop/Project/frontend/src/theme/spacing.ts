/**
 * Spacing tokens — 4px base grid (Phase 16.2 §2.3).
 *
 * The MUI theme spacing factor is set to SPACING_UNIT, so `sx` numbers map
 * 1:1 onto token indices: sx={{ p: 6 }} === space-6 === 24px.
 * All sibling separation uses flex/grid gap, never margins (Phase 16.4 rule).
 */
export const SPACING_UNIT = 4;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const layout = {
  /** Sidebar width, expanded / collapsed (icon-only). */
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  /** Top navigation bar height. */
  topNavHeight: 64,
  /** Notification drawer width. */
  drawerWidth: 360,
  /** Job detail side panel width. */
  detailPanelWidth: 640,
  /** Filter panel width on the job search workbench. */
  filterPanelWidth: 280,
  /** Command palette panel width. */
  commandPaletteWidth: 560,
  /** Mobile bottom navigation bar height (excludes safe-area inset). */
  bottomNavHeight: 56,

  /** Horizontal page padding by breakpoint tier. */
  pagePadding: { desktop: 40, tablet: 24, mobile: 16 },

  /** Content max-widths. */
  maxWidth: { narrow: 720, default: 1280, wide: 1440 },
} as const;
