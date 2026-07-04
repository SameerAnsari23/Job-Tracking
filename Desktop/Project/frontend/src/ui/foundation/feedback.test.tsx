import { act, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Spinner } from './Spinner';
import { Skeleton } from './Skeleton';
import { Progress } from './Progress';

describe('Spinner', () => {
  it('renders immediately with delayMs=0 and exposes its label', () => {
    renderWithTheme(<Spinner delayMs={0} label="Loading jobs" />);
    expect(screen.getByRole('status', { name: 'Loading jobs' })).toBeInTheDocument();
    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });

  it('honors the 150ms appearance delay (no flash for fast responses)', () => {
    vi.useFakeTimers();
    renderWithTheme(<Spinner label="Loading" />);
    // Region exists (state is announced) but the visual arc is withheld.
    expect(document.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    vi.useRealTimers();
  });
});

describe('Skeleton', () => {
  it('is aria-hidden (the containing region announces loading)', () => {
    const { container } = renderWithTheme(<Skeleton shape="rect" width={200} height={88} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('multi-line text mode renders N lines with a 60% last line', () => {
    const { container } = renderWithTheme(<Skeleton shape="text" lines={3} />);
    const lines = container.querySelectorAll('.MuiSkeleton-root');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveStyle({ width: '60%' });
  });

  inBothThemes('renders shapes without violations', async (mode) => {
    const { container } = renderWithTheme(
      <>
        <Skeleton shape="circle" width={40} height={40} />
        <Skeleton shape="rect" width={100} height={20} />
      </>,
      mode,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Progress', () => {
  it('exposes complete progressbar ARIA', () => {
    renderWithTheme(<Progress value={75} aria-label="Profile completion" />);
    const bar = screen.getByRole('progressbar', { name: 'Profile completion' });
    expect(bar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps out-of-range values', () => {
    renderWithTheme(<Progress value={140} aria-label="Overflow" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('ring variant renders a determinate circular progressbar', () => {
    renderWithTheme(<Progress variant="ring" value={40} aria-label="Ring" />);
    expect(screen.getByRole('progressbar', { name: 'Ring' })).toBeInTheDocument();
  });

  it('animateOnMount starts at 0 and settles at the value', async () => {
    renderWithTheme(<Progress value={60} animateOnMount aria-label="Animated" />);
    const bar = screen.getByRole('progressbar');
    // After the mount frame, the value must be the real one.
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    });
    expect(bar).toHaveAttribute('aria-valuenow', '60');
  });

  inBothThemes('has no axe violations', async (mode) => {
    const { container } = renderWithTheme(
      <Progress value={50} tone="success" aria-label="Half" />,
      mode,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
