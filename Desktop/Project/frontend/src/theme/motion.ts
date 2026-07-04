/**
 * Motion tokens (Phase 16.2 §6).
 *
 * The exponential ease-out cubic-bezier(0.16, 1, 0.3, 1) is the product
 * standard — snappy without overshoot. Spring easing is reserved for the
 * two celebration moments (discovery activation, profile 100%) plus the
 * save-bookmark icon. All motion collapses under prefers-reduced-motion:
 * CSS via the CssBaseline global rule, Framer via MotionConfig
 * reducedMotion="user" (set in Providers).
 */

export const duration = {
  /** Hover backgrounds, focus rings. */
  instant: 80,
  /** Button states, chip toggles. */
  fast: 150,
  /** Panel enter/exit, dropdown open. */
  base: 200,
  /** Page transitions, drawer slide. */
  slow: 300,
  /** Positive confirmation moments only. */
  spring: 400,
} as const;

export const easing = {
  /** Product standard — exponential ease-out. */
  standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Simple utility ease-out for hover/focus micro-transitions. */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Celebration overshoot — budgeted use only. */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  linear: 'linear',
} as const;

/** Framer Motion transition presets — same tokens, seconds + array easing. */
export const framerTransition = {
  instant: { duration: 0.08, ease: [0, 0, 0.2, 1] as const },
  fast: { duration: 0.15, ease: [0, 0, 0.2, 1] as const },
  base: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  slow: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  spring: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const },
} as const;

/** Page transition variants (Phase 16.2): enter rise+fade, exit fade. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: framerTransition.slow },
  exit: { opacity: 0, y: -4, transition: framerTransition.fast },
} as const;
