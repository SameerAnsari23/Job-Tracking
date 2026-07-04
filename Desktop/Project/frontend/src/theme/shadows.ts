/**
 * Shadow & elevation tokens (Phase 16.2 §2.5).
 *
 * Light mode: cards pair shadow-sm WITH a 1px border — both, very subtle.
 * Dark mode: NO shadows on cards (muddy) — elevation comes from background
 * lightness; only floating layers (dropdown/dialog/drawer) keep shadows,
 * built on a deeper black.
 */
export const shadowsLight = {
  xs: '0 1px 2px rgba(10, 10, 20, 0.06)',
  sm: '0 1px 4px rgba(10, 10, 20, 0.08), 0 1px 2px rgba(10, 10, 20, 0.04)',
  md: '0 4px 12px rgba(10, 10, 20, 0.10), 0 1px 4px rgba(10, 10, 20, 0.06)',
  lg: '0 8px 24px rgba(10, 10, 20, 0.12), 0 2px 8px rgba(10, 10, 20, 0.06)',
  xl: '0 16px 40px rgba(10, 10, 20, 0.14), 0 4px 12px rgba(10, 10, 20, 0.08)',
} as const;

export const shadowsDark = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: 'none',
  md: '0 4px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.25)',
  xl: '0 16px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
} as const;

export type ShadowTokens = typeof shadowsLight;

/**
 * Elevation semantics — which token each layer uses (Phase 16.2):
 * rest cards → sm · dropdowns/popovers → md · dialogs → lg · drawers → xl.
 */
export const elevation = {
  card: 'sm',
  dropdown: 'md',
  dialog: 'lg',
  drawer: 'xl',
} as const satisfies Record<string, keyof ShadowTokens>;
