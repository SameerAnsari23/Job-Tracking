import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { SalaryDisplay } from './SalaryDisplay';
import { LocationDisplay } from './LocationDisplay';

describe('SalaryDisplay', () => {
  inBothThemes('formats a compact range with the interval suffix', (mode) => {
    renderWithTheme(
      <SalaryDisplay
        compensation={{ min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' }}
      />,
      mode,
    );
    expect(screen.getByText(/\$180K/)).toBeInTheDocument();
    expect(screen.getByText(/\/ yr/)).toBeInTheDocument();
  });

  it('formats open-ended ranges: min-only and max-only', () => {
    const { rerender, container } = renderWithTheme(
      <SalaryDisplay
        compensation={{ min: 150_000, max: null, currency: 'USD', period: 'ANNUAL' }}
      />,
    );
    expect(container).toHaveTextContent(/From \$150K/);

    rerender(
      <SalaryDisplay
        compensation={{ min: null, max: 200_000, currency: 'USD', period: 'ANNUAL' }}
      />,
    );
    expect(container).toHaveTextContent(/Up to \$200K/);
  });

  it('renders nothing for fully undisclosed compensation (edge case: missing salary) — never "N/A"', () => {
    const { container, rerender } = renderWithTheme(<SalaryDisplay compensation={null} />);
    expect(container).toBeEmptyDOMElement();

    rerender(
      <SalaryDisplay compensation={{ min: null, max: null, currency: 'USD', period: 'ANNUAL' }} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(container).not.toHaveTextContent('N/A');
  });

  it('full format spells out the interval and uses standard notation', () => {
    renderWithTheme(
      <SalaryDisplay
        format="full"
        compensation={{ min: 180_000, max: 220_000, currency: 'USD', period: 'ANNUAL' }}
      />,
    );
    expect(screen.getByText(/\$180,000/)).toBeInTheDocument();
    expect(screen.getByText(/ANNUAL/)).toBeInTheDocument();
  });

  it('is localization-ready: different currencies and locales format via Intl, not a hardcoded symbol table', () => {
    const { rerender, container } = renderWithTheme(
      <SalaryDisplay
        compensation={{ min: 80_000, max: 100_000, currency: 'EUR', period: 'ANNUAL' }}
        locale="de-DE"
      />,
    );
    expect(container.textContent).toMatch(/€/);

    rerender(
      <SalaryDisplay
        compensation={{ min: 8_000_000, max: 12_000_000, currency: 'JPY', period: 'ANNUAL' }}
        locale="ja-JP"
      />,
    );
    // ja-JP renders the fullwidth yen sign (U+FFE5), not the standard ¥ (U+00A5).
    expect(container.textContent).toMatch(/[¥￥]/);
  });

  it('hourly and monthly intervals get the right compact suffix', () => {
    const { rerender, container } = renderWithTheme(
      <SalaryDisplay compensation={{ min: 40, max: 60, currency: 'USD', period: 'HOURLY' }} />,
    );
    expect(container).toHaveTextContent(/\/ hr/);

    rerender(
      <SalaryDisplay
        compensation={{ min: 8_000, max: 12_000, currency: 'USD', period: 'MONTHLY' }}
      />,
    );
    expect(container).toHaveTextContent(/\/ mo/);
  });
});

describe('LocationDisplay', () => {
  it('renders city, region, and country joined with commas', () => {
    renderWithTheme(<LocationDisplay city="San Francisco" region="CA" country="US" />);
    expect(screen.getByText('San Francisco, CA, US')).toBeInTheDocument();
  });

  it('a fully remote job with no location fields shows "Remote" alone', () => {
    renderWithTheme(<LocationDisplay workplaceType="REMOTE" />);
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('joins location and workplace type with a middle dot', () => {
    renderWithTheme(<LocationDisplay city="Berlin" country="Germany" workplaceType="HYBRID" />);
    expect(screen.getByText('Berlin, Germany · Hybrid')).toBeInTheDocument();
  });

  it('country-only location renders correctly (edge case)', () => {
    renderWithTheme(<LocationDisplay country="Germany" />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('renders nothing when no location and no workplace type are given', () => {
    const { container } = renderWithTheme(<LocationDisplay />);
    expect(container).toBeEmptyDOMElement();
  });

  it('multiple locations show a "+N more" affordance with a tooltip listing them (edge case)', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <LocationDisplay
        city="San Francisco"
        region="CA"
        additionalLocations={['New York, NY', 'Austin, TX']}
      />,
    );
    const more = screen.getByText('+2 more');
    await user.hover(more);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('New York, NY, Austin, TX');
  });

  it('compact mode hides the pin icon', () => {
    const { container } = renderWithTheme(
      <LocationDisplay city="Berlin" country="Germany" compact />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
