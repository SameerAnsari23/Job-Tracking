import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { WatchedCompaniesWidget } from './WatchedCompaniesWidget';
import { preferencesSuccessHandler, preferencesEmptyHandler } from '../tests/mocks/discoveryHandlers';

describe('WatchedCompaniesWidget', () => {
  it('renders every unique watched company across all profiles, deduplicated', async () => {
    server.use(preferencesSuccessHandler);
    renderDiscovery(<WatchedCompaniesWidget />);

    expect(await screen.findByText('Watched Companies (3)')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('Initech')).toBeInTheDocument();
  });

  it('shows an empty state with no watched companies', async () => {
    server.use(preferencesEmptyHandler);
    renderDiscovery(<WatchedCompaniesWidget />);
    expect(await screen.findByText('No companies watched yet')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<WatchedCompaniesWidget />);
    await screen.findByText('Acme');
    expect(await axe(container)).toHaveNoViolations();
  });
});
