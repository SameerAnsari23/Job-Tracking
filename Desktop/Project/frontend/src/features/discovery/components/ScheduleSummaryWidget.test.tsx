import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { ScheduleSummaryWidget } from './ScheduleSummaryWidget';
import { preferencesSuccessHandler, preferencesEmptyHandler } from '../tests/mocks/discoveryHandlers';

describe('ScheduleSummaryWidget', () => {
  it('renders the global default and a real per-frequency profile count', async () => {
    server.use(preferencesSuccessHandler);
    renderDiscovery(<ScheduleSummaryWidget />);

    // "Daily digest" legitimately appears twice: the global default's value,
    // and the per-frequency breakdown row's key.
    expect(await screen.findAllByText('Daily digest')).toHaveLength(2);
    expect(screen.getAllByText('1 profile')).toHaveLength(2); // 1 Daily + 1 Weekly
    expect(screen.getByText('Weekly digest')).toBeInTheDocument();
  });

  it('shows an empty state with no profiles', async () => {
    server.use(preferencesEmptyHandler);
    renderDiscovery(<ScheduleSummaryWidget />);
    expect(await screen.findByText('No schedule yet — add a discovery profile first.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<ScheduleSummaryWidget />);
    await screen.findAllByText('Daily digest');
    expect(await axe(container)).toHaveNoViolations();
  });
});
