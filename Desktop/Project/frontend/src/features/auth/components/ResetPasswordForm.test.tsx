import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderAuth } from '../tests/testUtils';
import { ResetPasswordForm } from './ResetPasswordForm';

describe('ResetPasswordForm', () => {
  it('renders an invalid-link message when there is no token', () => {
    renderAuth(<ResetPasswordForm token={null} />);
    expect(
      screen.getByText('This password reset link is invalid or has expired. Request a new one.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset password' })).not.toBeInTheDocument();
  });

  it('shows a validation error on empty submit', async () => {
    const user = userEvent.setup();
    renderAuth(<ResetPasswordForm token="valid-token" />);

    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('flags mismatched passwords', async () => {
    const user = userEvent.setup();
    renderAuth(<ResetPasswordForm token="valid-token" />);

    await user.type(screen.getByLabelText(/^New password/), 'a-strong-passw0rd!');
    await user.type(screen.getByLabelText(/^Confirm new password/), 'a-different-one!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows a success message and calls onSuccess after submit', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderAuth(<ResetPasswordForm token="valid-token" onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^New password/), 'a-strong-passw0rd!');
    await user.type(screen.getByLabelText(/^Confirm new password/), 'a-strong-passw0rd!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText('Your password has been reset. You can now sign in.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('has no axe violations', async () => {
    const { container } = renderAuth(<ResetPasswordForm token="valid-token" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
