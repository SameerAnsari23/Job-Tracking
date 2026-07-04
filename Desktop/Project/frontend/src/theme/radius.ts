/**
 * Border radius tokens (Phase 16.2 §2.4).
 * radius.lg (8px) is the default for all card-class surfaces; never larger
 * on cards — playful reads, not premium. Buttons/inputs use radius.md.
 */
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  full: 9999,
} as const;
