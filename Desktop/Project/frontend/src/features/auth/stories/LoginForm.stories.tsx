import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { LoginForm } from '../components/LoginForm';
import {
  loginSuccessHandler,
  loginInvalidCredentialsHandler,
  loginRateLimitedHandler,
  VALID_CREDENTIALS,
} from '../tests/mocks/authHandlers';

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  decorators: [(Story) => <Box sx={{ maxWidth: 400 }}>{Story()}</Box>],
};
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  parameters: { msw: { handlers: [loginSuccessHandler] } },
};

export const ValidationErrors: Story = {
  parameters: { msw: { handlers: [loginSuccessHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(canvas.getByText('Email is required.')).toBeInTheDocument());
    expect(canvas.getByText('Password is required.')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: { msw: { handlers: [loginSuccessHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Captured before submit: the loading state swaps the label for a
    // spinner, which changes the button's accessible name — re-querying by
    // name mid-flight would not find it.
    const submitButton = canvas.getByRole('button', { name: 'Sign in' });
    await userEvent.type(canvas.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await userEvent.type(canvas.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'true'));
  },
};

export const Success: Story = {
  parameters: { msw: { handlers: [loginSuccessHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Sign in' });
    await userEvent.type(canvas.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await userEvent.type(canvas.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).not.toHaveAttribute('aria-busy'));
  },
};

export const InvalidCredentials: Story = {
  parameters: { msw: { handlers: [loginInvalidCredentialsHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^Email/), 'wrong@example.com');
    await userEvent.type(canvas.getByLabelText(/^Password/), 'whatever-it-is');
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await waitFor(() =>
      expect(canvas.getByText('Incorrect email or password.')).toBeInTheDocument(),
    );
  },
};

export const RateLimited: Story = {
  parameters: { msw: { handlers: [loginRateLimitedHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^Email/), VALID_CREDENTIALS.email);
    await userEvent.type(canvas.getByLabelText(/^Password/), VALID_CREDENTIALS.password);
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
    await waitFor(() =>
      expect(
        canvas.getByText('Too many attempts. Please wait a moment and try again.'),
      ).toBeInTheDocument(),
    );
  },
};
