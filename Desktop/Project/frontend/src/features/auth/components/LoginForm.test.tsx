import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { axe } from 'vitest-axe';
import { server } from '@/test/server';
import { env } from '@/app/env';
import { renderAuth } from '../tests/testUtils';
import { LoginForm } from './LoginForm';
import {
  loginSuccessHandler,
  loginInvalidCredentialsHandler,
  loginRateLimitedHandler,
  loginNetworkErrorHandler,
  VALID_CREDENTIALS,
} from '../tests/mocks/authHandlers';

const url = (path: string) => `${env.apiBaseUrl}${path}`;

describe('LoginForm', () => {
  it('shows zod validation errors on empty submit without calling the network', async () => {
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('calls onSuccess after a valid login', async () => {
    server.use(loginSuccessHandler);
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderAuth(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('shows one generic message for invalid credentials — never distinguishes cases', async () => {
    server.use(loginInvalidCredentialsHandler);
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await user.type(screen.getByLabelText(/^Email/), 'nobody@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'whatever-it-is');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument();
  });

  it('shows a rate-limit message on 429', async () => {
    server.use(loginRateLimitedHandler);
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await user.type(screen.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Too many attempts. Please wait a moment and try again.'),
    ).toBeInTheDocument();
  });

  it('shows a connection message on network failure', async () => {
    server.use(loginNetworkErrorHandler);
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    await user.type(screen.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Connection failed. Check your internet connection.'),
    ).toBeInTheDocument();
  });

  it('locks the submit button while the request is in flight', async () => {
    // Deliberate latency, comfortably longer than userEvent's own typing
    // overhead: too short a delay and the mocked response can resolve
    // before this test ever observes the in-flight state.
    server.use(
      http.post(url('/auth/login'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return HttpResponse.json({
          success: true,
          data: {
            accessToken: 'a',
            refreshToken: 'r',
            expiresAt: new Date().toISOString(),
            userId: 'u1',
            email: VALID_CREDENTIALS.email,
            isVerified: true,
          },
        });
      }),
    );
    const user = userEvent.setup();
    renderAuth(<LoginForm />);

    // Captured once, by its stable pre-submit name: the loading state
    // swaps the label for a spinner, which can change the button's
    // computed accessible name — re-querying by name mid-flight is not
    // reliable, so we hold a reference to the same node instead.
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(screen.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await user.click(submitButton);

    await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'true'));
    await waitFor(() => expect(submitButton).not.toHaveAttribute('aria-busy'));
  });

  it('has no axe violations', async () => {
    const { container } = renderAuth(<LoginForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
