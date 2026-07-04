import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderAuth } from '../tests/testUtils';
import { ForgotPasswordForm } from './ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  it('shows a validation error on empty submit', async () => {
    const user = userEvent.setup();
    renderAuth(<ForgotPasswordForm />);

    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
  });

  it('shows a success message and calls onSuccess after submit', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderAuth(<ForgotPasswordForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(
      await screen.findByText('If an account exists for that email, a reset link is on its way.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('has no axe violations', async () => {
    const { container } = renderAuth(<ForgotPasswordForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
