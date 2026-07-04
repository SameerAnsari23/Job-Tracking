import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { StatisticCard } from './StatisticCard';
import { ChartCard } from './ChartCard';

describe('StatisticCard', () => {
  inBothThemes('renders label, value, and trend', (mode) => {
    renderWithTheme(
      <StatisticCard label="Saved jobs" value={24} trend={{ direction: 'up', delta: '+3' }} />,
      mode,
    );
    expect(screen.getByText('Saved jobs')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
  });

  it('renders a skeleton instead of content while loading', () => {
    renderWithTheme(<StatisticCard label="Saved jobs" value={24} loading />);
    expect(screen.queryByText('24')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('omits the sparkline with fewer than 3 points (never fabricate a trend line)', () => {
    const { container } = renderWithTheme(
      <StatisticCard label="Matches" value={5} sparkline={[1, 2]} />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders the sparkline path with 3+ points', () => {
    const { container } = renderWithTheme(
      <StatisticCard label="Matches" value={12} sparkline={[3, 5, 4, 8]} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('becomes a link when href is given', () => {
    renderWithTheme(<StatisticCard label="Saved jobs" value={24} href="/jobs/saved" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/jobs/saved');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <StatisticCard
        label="Saved jobs"
        value={24}
        icon="bookmark"
        trend={{ direction: 'up', delta: '+3' }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ChartCard', () => {
  it('renders title, subtitle, and legend', () => {
    renderWithTheme(
      <ChartCard
        title="Matches"
        subtitle="Last 30 days"
        legend={[{ label: 'Matches', color: '#5B5BD6' }]}
      >
        <div>chart</div>
      </ChartCard>,
    );
    expect(screen.getByRole('heading', { name: 'Matches' })).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    // "Matches" appears twice: the heading and the legend swatch label.
    expect(screen.getAllByText('Matches')).toHaveLength(2);
  });

  it('state precedence: loading > error > empty > content', () => {
    const { rerender } = renderWithTheme(
      <ChartCard title="Chart" loading error="boom" empty>
        <div>content</div>
      </ChartCard>,
    );
    expect(screen.getByRole('status', { name: 'Loading Chart' })).toBeInTheDocument();

    rerender(
      <ChartCard title="Chart" error="boom" empty>
        <div>content</div>
      </ChartCard>,
    );
    expect(screen.getByText('boom')).toBeInTheDocument();

    rerender(
      <ChartCard title="Chart" empty emptyMessage="Not enough data">
        <div>content</div>
      </ChartCard>,
    );
    expect(screen.getByText('Not enough data')).toBeInTheDocument();

    rerender(
      <ChartCard title="Chart">
        <div>content</div>
      </ChartCard>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('hides the footer while loading or errored', () => {
    const { rerender } = renderWithTheme(
      <ChartCard title="Chart" loading footer={<span>Updated 2h ago</span>} />,
    );
    expect(screen.queryByText('Updated 2h ago')).not.toBeInTheDocument();

    rerender(<ChartCard title="Chart" footer={<span>Updated 2h ago</span>} />);
    expect(screen.getByText('Updated 2h ago')).toBeInTheDocument();
  });
});
