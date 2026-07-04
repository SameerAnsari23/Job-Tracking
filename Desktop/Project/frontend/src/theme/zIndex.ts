/**
 * Z-index scale (Phase 16.2 §2.6).
 *
 * App-level tokens for custom CSS, plus the mapping applied to MUI's
 * internal zIndex object (relative order preserved: tooltip must float
 * above modal; toast above everything).
 */
export const zIndexTokens = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  drawer: 300,
  overlay: 350,
  modal: 400,
  command: 450,
  toast: 500,
} as const;

/** Applied to theme.zIndex — MUI components pick these up automatically. */
export const muiZIndex = {
  mobileStepper: zIndexTokens.raised,
  fab: zIndexTokens.raised,
  speedDial: zIndexTokens.raised,
  appBar: zIndexTokens.sticky,
  drawer: zIndexTokens.drawer,
  modal: zIndexTokens.modal,
  snackbar: zIndexTokens.toast,
  tooltip: zIndexTokens.toast + 50,
} as const;
