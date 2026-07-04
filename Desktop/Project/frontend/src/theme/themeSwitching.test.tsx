import { act, render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';
import { Providers } from '@/app/Providers';
import { useUiStore } from '@/shared/stores/uiStore';

function ThemeProbe() {
  const theme = useTheme();
  return <div data-testid="mode">{theme.palette.mode}</div>;
}

const initialState = useUiStore.getState();

afterEach(() => {
  act(() => {
    useUiStore.setState(initialState, true);
  });
  localStorage.clear();
});

describe('theme switching', () => {
  it('resolves system mode to light when the OS preference is light', () => {
    // setup.ts matchMedia mock always reports matches: false → light.
    render(
      <Providers>
        <ThemeProbe />
      </Providers>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('switches to dark when the store mode changes', () => {
    render(
      <Providers>
        <ThemeProbe />
      </Providers>,
    );
    act(() => {
      useUiStore.getState().setThemeMode('dark');
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('switches back to explicit light mode', () => {
    render(
      <Providers>
        <ThemeProbe />
      </Providers>,
    );
    act(() => {
      useUiStore.getState().setThemeMode('dark');
    });
    act(() => {
      useUiStore.getState().setThemeMode('light');
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });
});

describe('theme persistence', () => {
  it('persists the selected mode to localStorage under jobnotify-ui', () => {
    act(() => {
      useUiStore.getState().setThemeMode('dark');
    });
    const raw = localStorage.getItem('jobnotify-ui');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as { state: { themeMode: string } };
    expect(parsed.state.themeMode).toBe('dark');
  });

  it('uses the same storage key the index.html pre-paint script reads', () => {
    // Guards the no-flash contract: the inline script and the store must
    // agree on key and shape. If this shape changes, update index.html.
    act(() => {
      useUiStore.getState().setThemeMode('light');
    });
    const parsed = JSON.parse(localStorage.getItem('jobnotify-ui')!) as {
      state: Record<string, unknown>;
    };
    expect(parsed.state).toHaveProperty('themeMode');
  });
});

describe('reduced motion', () => {
  it('theme CssBaseline includes the prefers-reduced-motion collapse rule', async () => {
    const { lightTheme } = await import('./theme');
    const overrides = lightTheme.components?.MuiCssBaseline?.styleOverrides as Record<
      string,
      unknown
    >;
    const mediaKey = Object.keys(overrides).find((k) => k.includes('prefers-reduced-motion'));
    expect(mediaKey).toBeDefined();
    const rule = overrides[mediaKey!] as Record<string, Record<string, string>>;
    const universal = rule['*, *::before, *::after'];
    expect(universal).toBeDefined();
    expect(universal!.transitionDuration).toBe('0.01ms !important');
    expect(universal!.animationDuration).toBe('0.01ms !important');
  });
});
