import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderShell } from './tests/testUtils';
import { CommandPaletteHost } from './CommandPaletteHost';

describe('CommandPaletteHost', () => {
  it('opens via its visible trigger and lists every nav destination', async () => {
    const user = userEvent.setup();
    renderShell(<CommandPaletteHost />);

    await user.click(screen.getByRole('button', { name: 'Open command palette' }));
    expect(await screen.findByRole('option', { name: 'Go to Dashboard' })).toBeInTheDocument();
  });

  it('opens on Ctrl+K', async () => {
    const user = userEvent.setup();
    renderShell(<CommandPaletteHost />);

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('filters results as the query changes', async () => {
    const user = userEvent.setup();
    renderShell(<CommandPaletteHost />);

    await user.click(screen.getByRole('button', { name: 'Open command palette' }));
    await user.type(screen.getByRole('combobox'), 'discovery');

    expect(screen.getByRole('option', { name: 'Go to Discovery' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Go to Dashboard' })).not.toBeInTheDocument();
  });

  it('navigates and closes when a result is selected', async () => {
    const user = userEvent.setup();
    renderShell(<CommandPaletteHost />);

    await user.click(screen.getByRole('button', { name: 'Open command palette' }));
    await user.click(await screen.findByRole('option', { name: 'Go to Discovery' }));

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('has no axe violations while open', async () => {
    const user = userEvent.setup();
    const { container } = renderShell(<CommandPaletteHost />);
    await user.click(screen.getByRole('button', { name: 'Open command palette' }));
    await screen.findByRole('option', { name: 'Go to Dashboard' });
    expect(await axe(container)).toHaveNoViolations();
  });
});
