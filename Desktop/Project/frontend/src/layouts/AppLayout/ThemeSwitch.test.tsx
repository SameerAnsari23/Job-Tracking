import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/theme';
import { useUiStore } from '@/shared/stores/uiStore';
import { ThemeSwitch } from './ThemeSwitch';

describe('ThemeSwitch', () => {
  it('shows a moon icon and switches to dark when the resolved theme is light', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={lightTheme}>
        <ThemeSwitch />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    await user.click(button);
    expect(useUiStore.getState().themeMode).toBe('dark');
  });

  it('offers to switch to light when the resolved theme is dark', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <ThemeSwitch />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });
});
