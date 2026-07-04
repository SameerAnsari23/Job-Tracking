import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { renderAuth } from '../tests/testUtils';
import { SignupForm } from './SignupForm';
import {
  registerSuccessHandler,
  registerConflictHandler,
  loginAcceptAnyHandler,
} from '../tests/mocks/authHandlers';

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Email/), 'new.user@example.com');
  await user.type(screen.getByLabelText(/^Password/), 'a-strong-passw0rd!');
  await user.type(screen.getByLabelText(/^Confirm password/), 'a-strong-passw0rd!');
  await user.click(screen.getByRole('checkbox'));
}

describe('SignupForm', () => {
  it('shows zod validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderAuth(<SignupForm />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(screen.getByText('You must accept the terms to continue.')).toBeInTheDocument();
  });

  it('flags mismatched passwords', async () => {
    const user = userEvent.setup();
    renderAuth(<SignupForm />);

    await user.type(screen.getByLabelText(/^Email/), 'a@b.com');
    await user.type(screen.getByLabelText(/^Password/), 'a-strong-passw0rd!');
    await user.type(screen.getByLabelText(/^Confirm password/), 'does-not-match!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows a live advisory password-strength meter after first blur', async () => {
    const user = userEvent.setup();
    renderAuth(<SignupForm />);

    await user.type(screen.getByLabelText(/^Password/), 'weak');
    await user.tab();

    expect(screen.getByRole('meter', { name: 'Password strength' })).toBeInTheDocument();
  });

  it('registers then chains a login call, and calls onSuccess', async () => {
    server.use(registerSuccessHandler, loginAcceptAnyHandler);
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderAuth(<SignupForm onSuccess={onSuccess} />);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('surfaces a conflict as a field-level email error', async () => {
    server.use(registerConflictHandler);
    const user = userEvent.setup();
    renderAuth(<SignupForm />);

    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('An account with this email address already exists.'),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderAuth(<SignupForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
