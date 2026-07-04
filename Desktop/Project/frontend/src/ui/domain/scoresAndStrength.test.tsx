import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { MatchScore } from './MatchScore';
import { ProfileStrength } from './ProfileStrength';

describe('MatchScore', () => {
  inBothThemes('renders a labeled progressbar with the score value', (mode) => {
    renderWithTheme(<MatchScore score={92} />, mode);
    const bar = screen.getByRole('progressbar', { name: 'Match score 92%' });
    expect(bar).toHaveAttribute('aria-valuenow', '92');
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('clamps out-of-range scores', () => {
    const { rerender } = renderWithTheme(<MatchScore score={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<MatchScore score={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows a tooltip when the tooltip slot is provided', async () => {
    const user = userEvent.setup();
    renderWithTheme(<MatchScore score={80} tooltip="Matches your profile" />);
    await user.hover(screen.getByRole('progressbar').parentElement!);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Matches your profile');
  });

  it('never fabricates a score — it only renders the prop it is given', () => {
    renderWithTheme(<MatchScore score={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

describe('ProfileStrength', () => {
  it('renders the score and a labeled progress bar', async () => {
    renderWithTheme(<ProfileStrength score={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    // Progress animateOnMount starts at 0 and settles on the next frame.
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    });
    expect(screen.getByRole('progressbar', { name: 'Profile completion' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
  });

  it('renders a checklist with done/not-done items', () => {
    renderWithTheme(
      <ProfileStrength
        score={40}
        checklist={[
          { label: 'Basic profile', done: true },
          { label: 'Skills', done: false },
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Basic profile')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('renders the recommendations slot', () => {
    renderWithTheme(
      <ProfileStrength score={50} recommendationsSlot={<button>Add education</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Add education' })).toBeInTheDocument();
  });

  it('has no axe violations at 0%, 50%, and 100%', async () => {
    const { container, rerender } = renderWithTheme(<ProfileStrength score={0} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<ProfileStrength score={50} />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<ProfileStrength score={100} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
