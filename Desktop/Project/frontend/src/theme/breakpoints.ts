/**
 * Breakpoints (Phase 16.2 §5) — matches MUI's defaults exactly, declared
 * explicitly so the values are owned by the token system, not inherited.
 *
 * xs 0–599 mobile · sm 600–899 large phone/small tablet · md 900–1199
 * tablet/small laptop · lg 1200–1535 laptop/desktop · xl 1536+ large.
 */
export const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

/** Media query for the mobile heading downscale. */
export const mobileMediaQuery = `@media (max-width:${breakpointValues.sm - 0.05}px)`;
