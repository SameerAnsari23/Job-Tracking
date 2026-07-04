import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { CompanyLogo } from './CompanyLogo';
import { WorkplaceBadge } from './WorkplaceBadge';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { ProviderBadge } from './ProviderBadge';

describe('CompanyLogo', () => {
  inBothThemes('renders initials when no image is given', (mode) => {
    renderWithTheme(<CompanyLogo name="Stripe" size={32} />, mode);
    expect(screen.getByRole('img', { name: 'Stripe' })).toHaveTextContent('S');
  });

  it('recovers from a broken image by falling back to initials (never a broken-image glyph)', async () => {
    renderWithTheme(<CompanyLogo name="Broken Co" src="https://invalid.local/x.png" size={32} />);
    const img = document.querySelector('img')!;
    img.dispatchEvent(new Event('error'));
    expect(await screen.findByText('BC')).toBeInTheDocument();
  });

  it('falls back to the generic icon for an empty name and no image', () => {
    const { container } = renderWithTheme(<CompanyLogo name="" size={32} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('forwards a ref to the underlying element', () => {
    const ref = { current: null as HTMLSpanElement | null };
    renderWithTheme(<CompanyLogo ref={ref} name="Stripe" />);
    expect(ref.current).not.toBeNull();
  });

  it('a very long employer name still collapses to a 2-letter initials fallback (edge case)', () => {
    renderWithTheme(
      <CompanyLogo
        name="International Consolidated Financial Technology Holdings Group"
        size={32}
      />,
    );
    expect(screen.getByRole('img')).toHaveTextContent('IG');
  });
});

describe('WorkplaceBadge', () => {
  it('renders the three workplace types with correct labels', () => {
    const { rerender } = renderWithTheme(<WorkplaceBadge type="REMOTE" />);
    expect(screen.getByText('Remote')).toBeInTheDocument();
    rerender(<WorkplaceBadge type="HYBRID" />);
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    rerender(<WorkplaceBadge type="ONSITE" />);
    expect(screen.getByText('On-site')).toBeInTheDocument();
  });

  it('gives REMOTE the accent status label (differentiator) and others neutral', () => {
    renderWithTheme(<WorkplaceBadge type="REMOTE" />);
    expect(screen.getByLabelText('Status: Remote')).toBeInTheDocument();
  });
});

describe('EmploymentTypeBadge', () => {
  it('maps every known enum value to its display label', () => {
    const cases: Array<[Parameters<typeof EmploymentTypeBadge>[0]['type'], string]> = [
      ['FULL_TIME', 'Full-time'],
      ['PART_TIME', 'Part-time'],
      ['INTERNSHIP', 'Internship'],
      ['CONTRACT', 'Contract'],
      ['FREELANCE', 'Freelance'],
      ['TEMPORARY', 'Temporary'],
      ['VOLUNTEER', 'Volunteer'],
    ];
    for (const [type, label] of cases) {
      const { unmount } = renderWithTheme(<EmploymentTypeBadge type={type} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('UNKNOWN renders nothing without a custom label', () => {
    const { container } = renderWithTheme(<EmploymentTypeBadge type="UNKNOWN" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('UNKNOWN with a custom label renders it (the "custom" escape hatch)', () => {
    renderWithTheme(<EmploymentTypeBadge type="UNKNOWN" label="Fractional" />);
    expect(screen.getByText('Fractional')).toBeInTheDocument();
  });
});

describe('ProviderBadge', () => {
  it('renders the mono provider id and a tooltip with the display name', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ProviderBadge provider="greenhouse" />);
    const badge = screen.getByText('greenhouse');
    expect(badge).toBeInTheDocument();
    await user.hover(badge);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Greenhouse');
  });

  it('renders all 5 certified providers with correct display names', async () => {
    const user = userEvent.setup();
    const cases: Array<[string, string]> = [
      ['greenhouse', 'Greenhouse'],
      ['lever', 'Lever'],
      ['ashby', 'Ashby'],
      ['smartrecruiters', 'SmartRecruiters'],
      ['workday', 'Workday'],
    ];
    for (const [id, name] of cases) {
      const { unmount } = renderWithTheme(<ProviderBadge provider={id} />);
      await user.hover(screen.getByText(id));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(name);
      unmount();
    }
  });

  it('an unrecognized provider id still renders, with a generic tooltip (edge case)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ProviderBadge provider="acme-custom-ats" />);
    const badge = screen.getByText('acme-custom-ats');
    expect(badge).toBeInTheDocument();
    await user.hover(badge);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Unrecognized source');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<ProviderBadge provider="greenhouse" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
