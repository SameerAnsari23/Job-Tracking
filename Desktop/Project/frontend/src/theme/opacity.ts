/**
 * Opacity tokens.
 * disabled: all disabled interactive elements (Phase 16.2 G-contract).
 * paused: paused DiscoveryCard treatment (Phase 16.3 §1.5).
 * scrim values match the surface overlay tokens in colors.ts.
 */
export const opacity = {
  disabled: 0.4,
  paused: 0.7,
  scrimLight: 0.4,
  scrimDark: 0.7,
  /** Decorative illustration strokes over the gradient hero panel. */
  decorative: 0.2,
} as const;
