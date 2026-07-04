import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from '@/theme';
import { RouteErrorBoundary } from './RouteErrorBoundary';

function Bomb(): never {
  throw new Error('boom');
}

describe('RouteErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let reloadSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when nothing throws', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <RouteErrorBoundary>
          <div>All good</div>
        </RouteErrorBoundary>
      </ThemeProvider>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('catches a render error and shows the themed ErrorState instead of a blank page', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <RouteErrorBoundary>
          <Bomb />
        </RouteErrorBoundary>
      </ThemeProvider>,
    );
    expect(screen.getByText('This page hit an error')).toBeInTheDocument();
  });

  it('the retry action reloads the page', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider theme={lightTheme}>
        <RouteErrorBoundary>
          <Bomb />
        </RouteErrorBoundary>
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reloadSpy).toHaveBeenCalledOnce();
  });
});
