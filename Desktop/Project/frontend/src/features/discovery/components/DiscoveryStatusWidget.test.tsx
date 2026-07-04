import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { DiscoveryStatusWidget } from './DiscoveryStatusWidget';
import {
  preferencesSuccessHandler,
  preferencesEmptyHandler,
  preferencesErrorHandler,
  activateHandler,
  deactivateHandler,
} from '../tests/mocks/discoveryHandlers';

describe('DiscoveryStatusWidget', () => {
  it('shows the loading skeleton before data arrives', () => {
    server.use(preferencesSuccessHandler);
    renderDiscovery(<DiscoveryStatusWidget />);
    expect(screen.getByRole('status', { name: 'Loading Discovery Status' })).toBeInTheDocument();
  });

  it('renders active/total profile counts and an Active state', async () => {
    server.use(preferencesSuccessHandler);
    renderDiscovery(<DiscoveryStatusWidget />);

    expect(await screen.findByText('1 of 2 profiles active')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('deactivates discovery through the real mutation', async () => {
    server.use(preferencesSuccessHandler, deactivateHandler);
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryStatusWidget />);

    await user.click(await screen.findByRole('button', { name: 'Deactivate' }));
    // MSW's onUnhandledRequest:'error' fails the test if this hits the
    // wrong endpoint or with the wrong method.
  });

  it('activates discovery when currently paused', async () => {
    server.use(preferencesEmptyHandler, activateHandler);
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryStatusWidget />);

    expect(await screen.findByText('Paused')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Activate' }));
  });

  it('shows an error with retry', async () => {
    server.use(preferencesErrorHandler);
    renderDiscovery(<DiscoveryStatusWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<DiscoveryStatusWidget />);
    await screen.findByText('Active');
    expect(await axe(container)).toHaveNoViolations();
  });
});
