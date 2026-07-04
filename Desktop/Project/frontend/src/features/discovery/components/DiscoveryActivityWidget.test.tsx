import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { DiscoveryActivityWidget } from './DiscoveryActivityWidget';
import {
  recommendationsSuccessHandler,
  recommendationsEmptyHandler,
  recommendationsErrorHandler,
} from '../tests/mocks/discoveryHandlers';

describe('DiscoveryActivityWidget', () => {
  it('renders recent matches as a timeline (an ordered list)', async () => {
    server.use(recommendationsSuccessHandler);
    renderDiscovery(<DiscoveryActivityWidget />);

    expect(await screen.findByText('Backend Engineer at Acme')).toBeInTheDocument();
    expect(screen.getByText('Platform Engineer at Globex')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('shows an honest empty state with no matches', async () => {
    server.use(recommendationsEmptyHandler);
    renderDiscovery(<DiscoveryActivityWidget />);
    expect(await screen.findByText('No matches yet')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(recommendationsErrorHandler);
    renderDiscovery(<DiscoveryActivityWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(recommendationsSuccessHandler);
    const { container } = renderDiscovery(<DiscoveryActivityWidget />);
    await screen.findByText('Backend Engineer at Acme');
    expect(await axe(container)).toHaveNoViolations();
  });
});
