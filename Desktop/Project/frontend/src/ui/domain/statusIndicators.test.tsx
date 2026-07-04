import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { DiscoveryStatus } from './DiscoveryStatus';
import { QueueStatus } from './QueueStatus';
import { HealthIndicator } from './HealthIndicator';

describe('DiscoveryStatus', () => {
  const STATES = ['active', 'paused', 'running', 'backoff', 'error'] as const;

  it('renders all 5 states with their labels', () => {
    for (const state of STATES) {
      const { unmount } = renderWithTheme(<DiscoveryStatus state={state} />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        expect.stringContaining(
          state === 'active'
            ? 'Active'
            : state === 'paused'
              ? 'Paused'
              : state === 'running'
                ? 'Running'
                : state === 'backoff'
                  ? 'Retrying'
                  : 'Error',
        ),
      );
      unmount();
    }
  });

  inBothThemes('renders the summary and action slot', (mode) => {
    renderWithTheme(
      <DiscoveryStatus
        state="active"
        summary="3 profiles active"
        actionSlot={<button>Deactivate</button>}
      />,
      mode,
    );
    expect(screen.getByText('3 profiles active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('data-state reflects the current state', () => {
    const { container } = renderWithTheme(<DiscoveryStatus state="running" />);
    expect(container.querySelector('[data-state="running"]')).toBeInTheDocument();
  });
});

describe('QueueStatus', () => {
  it('renders the mono queue name and state', () => {
    renderWithTheme(<QueueStatus name="crawl-dispatch" state="idle" />);
    expect(screen.getByText('crawl-dispatch')).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('renders UNAVAILABLE instead of a fabricated number when depth is absent (admin honesty rule)', () => {
    const { rerender } = renderWithTheme(<QueueStatus name="q" state="idle" depth={null} />);
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument();
    rerender(<QueueStatus name="q" state="idle" depth={undefined} />);
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument();
  });

  it('renders the real depth when provided', () => {
    renderWithTheme(<QueueStatus name="q" state="processing" depth={12} />);
    expect(screen.getByText('12 in queue')).toBeInTheDocument();
    expect(screen.queryByText('UNAVAILABLE')).not.toBeInTheDocument();
  });

  it('renders cadence and retry policy when given', () => {
    renderWithTheme(
      <QueueStatus name="q" state="idle" cadence="Every 15 min" retryPolicy="3 attempts" />,
    );
    expect(screen.getByText('Every 15 min')).toBeInTheDocument();
    expect(screen.getByText('3 attempts')).toBeInTheDocument();
  });
});

describe('HealthIndicator', () => {
  it('renders label, state text, and lastChecked together', () => {
    renderWithTheme(<HealthIndicator state="healthy" label="MongoDB" lastChecked="just now" />);
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
    expect(screen.getByText(/just now/)).toBeInTheDocument();
  });

  it('status is never color-only — the dot always carries an accessible name', () => {
    renderWithTheme(<HealthIndicator state="unhealthy" label="API" />);
    expect(screen.getByRole('status', { name: 'API: Down' })).toBeInTheDocument();
  });

  it('unknown state renders without a label gracefully', () => {
    renderWithTheme(<HealthIndicator state="unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('has no axe violations across all 4 states', async () => {
    const { container, rerender } = renderWithTheme(<HealthIndicator state="healthy" label="A" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<HealthIndicator state="degraded" label="A" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<HealthIndicator state="unhealthy" label="A" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<HealthIndicator state="unknown" label="A" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
