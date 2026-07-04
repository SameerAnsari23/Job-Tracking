import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/theme';

/**
 * Renders a component inside the real product theme. Every ui/ component
 * test runs at least its render assertions in BOTH themes.
 */
export function renderWithTheme(ui: ReactElement, mode: 'light' | 'dark' = 'light'): RenderResult {
  return render(
    <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>{ui}</ThemeProvider>,
  );
}

/** Runs the same assertion set against both themes. */
export function inBothThemes(name: string, fn: (mode: 'light' | 'dark') => void): void {
  for (const mode of ['light', 'dark'] as const) {
    it(`${name} (${mode})`, () => fn(mode));
  }
}
