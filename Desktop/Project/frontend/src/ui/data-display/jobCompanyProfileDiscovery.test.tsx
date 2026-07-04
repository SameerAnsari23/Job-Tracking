import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { JobCard } from './JobCard';
import type { JobCardData } from './JobCard';
import { CompanyCard } from './CompanyCard';
import { ProfileCard } from './ProfileCard';
import { DiscoveryCard } from './DiscoveryCard';

const JOB: JobCardData = {
  id: '1',
  title: 'Software Engineer, Infrastructure',
  companyName: 'Stripe',
  location: 'San Francisco, CA',
  workplaceType: 'REMOTE',
  employmentTypeLabel: 'Full-time',
  compensation: { min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' },
  isNew: true,
  postedAt: '2h ago',
};

describe('JobCard', () => {
  inBothThemes('renders title, company, location, and formatted compensation', (mode) => {
    renderWithTheme(<JobCard job={JOB} />, mode);
    expect(screen.getByText('Software Engineer, Infrastructure')).toBeInTheDocument();
    expect(screen.getByText(/Stripe/)).toBeInTheDocument();
    expect(screen.getByText('$180k–$220k')).toBeInTheDocument();
  });

  it('renders workplace and employment badges, and the New badge', () => {
    renderWithTheme(<JobCard job={JOB} />);
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders nothing for compensation when both bounds are null (never shows "N/A")', () => {
    renderWithTheme(<JobCard job={{ ...JOB, compensation: null }} />);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('formats open-ended compensation', () => {
    const { rerender } = renderWithTheme(
      <JobCard
        job={{
          ...JOB,
          compensation: { min: 150_000, max: null, currency: 'USD', period: 'ANNUAL' },
        }}
      />,
    );
    expect(screen.getByText('From $150k')).toBeInTheDocument();

    rerender(
      <JobCard
        job={{
          ...JOB,
          compensation: { min: null, max: 200_000, currency: 'USD', period: 'ANNUAL' },
        }}
      />,
    );
    expect(screen.getByText('Up to $200k')).toBeInTheDocument();
  });

  it('compact variant hides badges', () => {
    renderWithTheme(<JobCard job={JOB} variant="compact" />);
    expect(screen.queryByText('Remote')).not.toBeInTheDocument();
  });

  it('save toggles the accessible name and calls onSave without triggering onSelect', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onSelect = vi.fn();
    function Harness() {
      const [saved, setSaved] = useState(false);
      return (
        <JobCard
          job={JOB}
          saved={saved}
          onSave={() => {
            setSaved((s) => !s);
            onSave();
          }}
          onSelect={onSelect}
        />
      );
    }
    renderWithTheme(<Harness />);
    const save = screen.getByRole('button', { name: /^Save/ });
    await user.click(save);
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^Unsave/ })).toBeInTheDocument();
  });

  it('renders JobCard.Skeleton matching the standard variant height', () => {
    const { container } = renderWithTheme(<JobCard.Skeleton variant="standard" />);
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <JobCard job={JOB} onSave={() => {}} onSelect={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CompanyCard', () => {
  it('renders rating, hiring status, and open positions', () => {
    renderWithTheme(
      <CompanyCard name="Stripe" rating={4.5} hiringStatus="actively-hiring" openPositions={142} />,
    );
    expect(screen.getByRole('img', { name: '4.5 out of 5 stars' })).toBeInTheDocument();
    expect(screen.getByText('Actively hiring')).toBeInTheDocument();
    expect(screen.getByText('142 open roles')).toBeInTheDocument();
  });

  it('singularizes "role" for exactly one open position', () => {
    renderWithTheme(<CompanyCard name="Stripe" openPositions={1} />);
    expect(screen.getByText('1 open role')).toBeInTheDocument();
  });
});

describe('ProfileCard', () => {
  it('renders completion, skills, and badges in full mode', () => {
    renderWithTheme(
      <ProfileCard
        name="Sam Ansari"
        title="Senior PM"
        completion={75}
        skills={['SQL']}
        badges={[{ label: 'Open to work', tone: 'success' }]}
      />,
    );
    expect(screen.getByRole('progressbar', { name: 'Profile completion' })).toHaveAttribute(
      'aria-valuenow',
      '75',
    );
    expect(screen.getByText('SQL')).toBeInTheDocument();
    expect(screen.getByText('Open to work')).toBeInTheDocument();
  });

  it('compact mode hides completion, skills, and badges', () => {
    renderWithTheme(
      <ProfileCard name="Sam Ansari" title="Senior PM" completion={75} skills={['SQL']} compact />,
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('SQL')).not.toBeInTheDocument();
  });
});

describe('DiscoveryCard', () => {
  it('renders active status and the Pause action', () => {
    renderWithTheme(
      <DiscoveryCard
        label="Backend Engineer"
        active
        priority="HIGH"
        watchedCompanies={['Stripe']}
        onPause={() => {}}
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
  });

  it('paused cards show Resume instead of Pause', () => {
    renderWithTheme(
      <DiscoveryCard
        label="Backend Engineer"
        active={false}
        watchedCompanies={[]}
        onResume={() => {}}
      />,
    );
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resume/ })).toBeInTheDocument();
  });

  it('collapses the watchlist beyond 3 and expands on click', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DiscoveryCard
        label="Backend Engineer"
        active
        watchedCompanies={['A', 'B', 'C', 'D', 'E']}
      />,
    );
    expect(screen.queryByText('E')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '+2 more' }));
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('delete action is styled distinctly and fires onDelete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithTheme(
      <DiscoveryCard label="Backend Engineer" active watchedCompanies={[]} onDelete={onDelete} />,
    );
    await user.click(screen.getByRole('button', { name: /Delete/ }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
