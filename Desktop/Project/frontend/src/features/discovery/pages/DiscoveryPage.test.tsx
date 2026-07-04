import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { signIn, renderDiscovery } from '../tests/testUtils';
import { DiscoveryPage } from './DiscoveryPage';
import {
  discoverySuccessHandlers,
  discoveryMutationHandlers,
} from '../tests/mocks/discoveryHandlers';

describe('DiscoveryPage', () => {
  beforeEach(() => {
    signIn('jane@example.com');
    server.use(...discoverySuccessHandlers, ...discoveryMutationHandlers);
  });

  it('renders a single h1 and every widget', async () => {
    renderDiscovery(<DiscoveryPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Discovery' })).toBeInTheDocument();

    expect(await screen.findByText('1 of 2 profiles active')).toBeInTheDocument(); // status
    expect(screen.getByText('Backend roles')).toBeInTheDocument(); // profiles
    expect(screen.getByText('Watched Companies (3)')).toBeInTheDocument(); // companies
    expect(screen.getByText('On')).toBeInTheDocument(); // automation
    expect(screen.getAllByText('Daily digest').length).toBeGreaterThan(0); // schedule
    expect(screen.getByText('Backend Engineer at Acme')).toBeInTheDocument(); // activity
    expect(screen.getByRole('button', { name: 'View matches' })).toBeInTheDocument(); // quick actions
  });

  it('has a sane heading hierarchy (one h1, then h2, then widget h3s)', async () => {
    renderDiscovery(<DiscoveryPage />);
    await screen.findByText('Backend roles');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  });

  it('has no axe violations once fully loaded', async () => {
    const { container } = renderDiscovery(<DiscoveryPage />);
    await screen.findByText('Backend roles');
    await screen.findByText('Backend Engineer at Acme');
    expect(await axe(container)).toHaveNoViolations();
  });
});
