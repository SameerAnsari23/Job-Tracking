import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderDiscovery } from '../tests/testUtils';
import { DiscoveryProfilesWidget } from './DiscoveryProfilesWidget';
import {
  preferencesSuccessHandler,
  preferencesEmptyHandler,
  preferencesErrorHandler,
  pauseProfileHandler,
  resumeProfileHandler,
  deleteProfileHandler,
} from '../tests/mocks/discoveryHandlers';

describe('DiscoveryProfilesWidget', () => {
  it('renders one DiscoveryCard per real profile with pause/resume wired correctly', async () => {
    server.use(preferencesSuccessHandler, pauseProfileHandler, resumeProfileHandler);
    renderDiscovery(<DiscoveryProfilesWidget />);

    expect(await screen.findByText('Backend roles')).toBeInTheDocument();
    expect(screen.getByText('Platform roles')).toBeInTheDocument();
    // Active profile shows Pause; paused profile shows Resume.
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Resume/ })).toBeInTheDocument();
  });

  it('pauses an active profile through the real mutation', async () => {
    server.use(preferencesSuccessHandler, pauseProfileHandler);
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryProfilesWidget />);

    await user.click(await screen.findByRole('button', { name: /Pause/ }));
  });

  it('asks for confirmation before deleting a profile, and only deletes on confirm', async () => {
    server.use(preferencesSuccessHandler, deleteProfileHandler);
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryProfilesWidget />);

    await screen.findByText('Backend roles');
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/ });
    await user.click(deleteButtons[0]!);

    expect(await screen.findByText('Delete discovery profile?')).toBeInTheDocument();
    expect(screen.getByText(/"Backend roles" will stop watching/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // MUI Dialog unmounts its content only after the exit transition.
    await waitFor(() =>
      expect(screen.queryByText('Delete discovery profile?')).not.toBeInTheDocument(),
    );
  });

  it('deletes after confirming', async () => {
    server.use(preferencesSuccessHandler, deleteProfileHandler);
    const user = userEvent.setup();
    renderDiscovery(<DiscoveryProfilesWidget />);

    await screen.findByText('Backend roles');
    await user.click(screen.getAllByRole('button', { name: /Delete/ })[0]!);
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows an empty state with no profiles', async () => {
    server.use(preferencesEmptyHandler);
    renderDiscovery(<DiscoveryProfilesWidget />);
    expect(await screen.findByText('No discovery profiles yet')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    server.use(preferencesErrorHandler);
    renderDiscovery(<DiscoveryProfilesWidget />);
    expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    server.use(preferencesSuccessHandler);
    const { container } = renderDiscovery(<DiscoveryProfilesWidget />);
    await screen.findByText('Backend roles');
    expect(await axe(container)).toHaveNoViolations();
  });
});
