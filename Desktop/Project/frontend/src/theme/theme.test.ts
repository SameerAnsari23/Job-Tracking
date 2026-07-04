import { lightTheme, darkTheme } from './theme';
import { accent, accentDark, surfacesLight, surfacesDark, neutralLight } from './colors';
import { radius } from './radius';
import { zIndexTokens } from './zIndex';
import { duration } from './motion';

describe('theme construction', () => {
  it('builds light and dark themes from the token map', () => {
    expect(lightTheme.palette.mode).toBe('light');
    expect(darkTheme.palette.mode).toBe('dark');
    expect(lightTheme.palette.primary.main).toBe(accent[500]);
    expect(darkTheme.palette.primary.main).toBe(accentDark[500]);
    expect(lightTheme.palette.background.default).toBe(surfacesLight.app);
    expect(darkTheme.palette.background.default).toBe(surfacesDark.app);
    expect(darkTheme.palette.background.paper).toBe(surfacesDark.surface);
  });

  it('uses the 4px spacing grid (sx unit === token index)', () => {
    expect(lightTheme.spacing(1)).toBe('4px');
    expect(lightTheme.spacing(6)).toBe('24px');
    expect(lightTheme.spacing(10)).toBe('40px');
  });

  it('uses radius-lg as the global shape and disables ripple', () => {
    expect(lightTheme.shape.borderRadius).toBe(radius.lg);
    expect(lightTheme.components?.MuiButtonBase?.defaultProps?.disableRipple).toBe(true);
  });

  it('applies the product z-index scale with correct layer ordering', () => {
    expect(lightTheme.zIndex.drawer).toBe(zIndexTokens.drawer);
    expect(lightTheme.zIndex.modal).toBe(zIndexTokens.modal);
    expect(lightTheme.zIndex.snackbar).toBe(zIndexTokens.toast);
    expect(lightTheme.zIndex.drawer).toBeLessThan(lightTheme.zIndex.modal);
    expect(lightTheme.zIndex.modal).toBeLessThan(lightTheme.zIndex.snackbar);
    expect(lightTheme.zIndex.snackbar).toBeLessThan(lightTheme.zIndex.tooltip);
  });

  it('maps motion tokens onto MUI transitions', () => {
    expect(lightTheme.transitions.duration.shortest).toBe(duration.instant);
    expect(lightTheme.transitions.duration.standard).toBe(duration.base);
    expect(lightTheme.transitions.easing.easeInOut).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  it('sets the 11-step type scale on MUI variants', () => {
    expect(lightTheme.typography.h1.fontSize).toBe('38px');
    expect(lightTheme.typography.h2.fontSize).toBe('30px');
    expect(lightTheme.typography.body1.fontSize).toBe('15px');
    expect(lightTheme.typography.body2.fontSize).toBe('13px');
    expect(lightTheme.typography.overline.textTransform).toBe('uppercase');
    expect(lightTheme.typography.button.textTransform).toBe('none');
    expect(String(lightTheme.typography.fontFamily)).toContain('Inter');
  });

  it('applies responsive heading downscale for mobile', () => {
    const h1 = lightTheme.typography.h1 as Record<string, unknown>;
    const mobileKey = Object.keys(h1).find((k) => k.startsWith('@media'));
    expect(mobileKey).toBeDefined();
    expect((h1[mobileKey!] as { fontSize: string }).fontSize).toBe('28px');
  });

  it('keeps dark-mode cards shadow-free and light-mode cards on shadow-sm', () => {
    const lightCard = lightTheme.components?.MuiCard?.styleOverrides?.root as Record<
      string,
      unknown
    >;
    const darkCard = darkTheme.components?.MuiCard?.styleOverrides?.root as Record<string, unknown>;
    expect(lightCard.boxShadow).toContain('rgba(10, 10, 20');
    expect(darkCard.boxShadow).toBe('none');
    expect(String(lightCard.border)).toContain(neutralLight[200]);
  });
});
