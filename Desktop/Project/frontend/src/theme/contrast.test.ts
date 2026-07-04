import { lightTheme, darkTheme } from './theme';
import { accent, accentDark, semanticLight, semanticDark, sidebar } from './colors';

/**
 * WCAG 2.1 contrast verification — COMPUTED, not assumed. These assertions
 * are the Phase 16.2 contrast table turned into a regression gate: any token
 * change that breaks AA fails CI.
 */
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

const AA = 4.5;
const AAA = 7;

describe('light theme contrast (WCAG 2.1)', () => {
  const paper = lightTheme.palette.background.paper;

  it('primary text on surface meets AAA', () => {
    expect(contrast(lightTheme.palette.text.primary, paper)).toBeGreaterThanOrEqual(AAA);
  });

  it('secondary text on surface meets AA', () => {
    expect(contrast(lightTheme.palette.text.secondary, paper)).toBeGreaterThanOrEqual(AA);
  });

  it('accent-500 on surface meets AA (links, active states)', () => {
    expect(contrast(accent[500], paper)).toBeGreaterThanOrEqual(AA);
  });

  it('white on accent-500 meets AA (primary button)', () => {
    expect(contrast('#FFFFFF', accent[500])).toBeGreaterThanOrEqual(AA);
  });

  it('semantic text on semantic subtle backgrounds meets AA (badges)', () => {
    expect(contrast(semanticLight.successText, semanticLight.successSubtle)).toBeGreaterThanOrEqual(
      AA,
    );
    expect(contrast(semanticLight.warningText, semanticLight.warningSubtle)).toBeGreaterThanOrEqual(
      AA,
    );
    expect(contrast(semanticLight.errorText, semanticLight.errorSubtle)).toBeGreaterThanOrEqual(AA);
  });
});

describe('dark theme contrast (WCAG 2.1)', () => {
  const paper = darkTheme.palette.background.paper;

  it('primary text on surface meets AAA', () => {
    expect(contrast(darkTheme.palette.text.primary, paper)).toBeGreaterThanOrEqual(AAA);
  });

  it('secondary text on surface meets AA', () => {
    expect(contrast(darkTheme.palette.text.secondary, paper)).toBeGreaterThanOrEqual(AA);
  });

  it('accent on surface and button foreground on accent meet AA', () => {
    expect(contrast(accentDark[500], paper)).toBeGreaterThanOrEqual(AA);
    // Dark mode uses ink foreground on the lighter accent (white fails at
    // 3.66:1 — measured correction to the 16.2 table).
    expect(contrast(accentDark.foreground, accentDark[500])).toBeGreaterThanOrEqual(AA);
  });

  it('semantic text on semantic subtle backgrounds meets AA', () => {
    expect(contrast(semanticDark.successText, semanticDark.successSubtle)).toBeGreaterThanOrEqual(
      AA,
    );
    expect(contrast(semanticDark.warningText, semanticDark.warningSubtle)).toBeGreaterThanOrEqual(
      AA,
    );
    expect(contrast(semanticDark.errorText, semanticDark.errorSubtle)).toBeGreaterThanOrEqual(AA);
  });
});

describe('sidebar contrast (always dark — both themes)', () => {
  it('rest nav text on sidebar background meets AA', () => {
    expect(contrast(sidebar.textRest, sidebar.bgLight)).toBeGreaterThanOrEqual(AA);
  });

  it('active nav text on active item background meets AA', () => {
    expect(contrast(sidebar.textActive, sidebar.itemActive)).toBeGreaterThanOrEqual(AA);
  });

  it('hover nav text on hover background meets AAA', () => {
    expect(contrast(sidebar.textHover, sidebar.itemHover)).toBeGreaterThanOrEqual(AAA);
  });
});
