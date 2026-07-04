import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Tabs } from './Tabs';

const ITEMS = [
  { value: 'overview', label: 'Overview', content: <span>Overview panel</span> },
  {
    value: 'experience',
    label: 'Experience',
    icon: 'briefcase' as const,
    content: <span>Experience panel</span>,
  },
  { value: 'skills', label: 'Skills', count: 12, content: <span>Skills panel</span> },
  { value: 'disabled', label: 'Disabled', disabled: true, content: <span>never</span> },
];

describe('Tabs — underline variant', () => {
  inBothThemes('renders a tablist with the correct ARIA roles', (mode) => {
    renderWithTheme(
      <Tabs aria-label="Profile sections" items={ITEMS} defaultValue="overview" />,
      mode,
    );
    expect(screen.getByRole('tablist', { name: 'Profile sections' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('renders icons and count badges in the tab label', () => {
    renderWithTheme(<Tabs items={ITEMS} defaultValue="overview" />);
    expect(
      screen.getByRole('tab', { name: /Experience/ }).querySelector('svg'),
    ).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('uncontrolled: clicking a tab switches the panel and lazily mounts it once', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Tabs items={ITEMS} defaultValue="overview" />);
    expect(screen.getByText('Overview panel')).toBeInTheDocument();
    expect(screen.queryByText('Experience panel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Experience/ }));
    expect(screen.getByText('Experience panel')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    // Experience panel stays mounted (hidden), not removed — lazy-mount-once.
    expect(screen.getByText('Experience panel')).not.toBeVisible();
  });

  it('controlled: external value drives selection and onChange fires', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [value, setValue] = useState('overview');
      return <Tabs items={ITEMS} value={value} onChange={setValue} />;
    }
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole('tab', { name: /Skills/ }));
    expect(screen.getByRole('tab', { name: /Skills/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Skills panel')).toBeInTheDocument();
  });

  it('disabled tabs cannot be selected', () => {
    renderWithTheme(<Tabs items={ITEMS} defaultValue="overview" />);
    expect(screen.getByRole('tab', { name: 'Disabled' })).toBeDisabled();
  });

  it('renders as a strip only when no item provides panel content', () => {
    renderWithTheme(
      <Tabs
        items={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        defaultValue="a"
      />,
    );
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });
});

describe('Tabs — segmented variant', () => {
  it('implements a strict roving-tabindex tablist', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Tabs variant="segmented" aria-label="Sort" items={ITEMS} defaultValue="overview" />,
    );
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const experience = screen.getByRole('tab', { name: /Experience/ });
    expect(overview).toHaveAttribute('tabindex', '0');
    expect(experience).toHaveAttribute('tabindex', '-1');

    overview.focus();
    await user.keyboard('{ArrowRight}');
    expect(experience).toHaveFocus();
    expect(experience).toHaveAttribute('tabindex', '0');
    expect(overview).toHaveAttribute('tabindex', '-1');
  });

  it('wires role=tab/tabpanel with aria-selected and aria-controls', () => {
    renderWithTheme(
      <Tabs variant="segmented" aria-label="Sort" items={ITEMS} defaultValue="overview" />,
    );
    const overview = screen.getByRole('tab', { name: 'Overview' });
    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(overview).toHaveAttribute('aria-controls');
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(
      <Tabs variant="segmented" aria-label="Sort" items={ITEMS} defaultValue="overview" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
