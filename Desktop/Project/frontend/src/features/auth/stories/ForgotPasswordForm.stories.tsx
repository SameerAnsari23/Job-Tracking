import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

/**
 * SCAFFOLD (Phase 18.0): useForgotPassword resolves locally (no network —
 * no backend endpoint exists yet), so "success" here is the real production
 * code path, not a fake network mock like LoginForm/SignupForm need.
 */
const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'Auth/ForgotPasswordForm',
  component: ForgotPasswordForm,
  decorators: [(Story) => <Box sx={{ maxWidth: 400 }}>{Story()}</Box>],
};
export default meta;

type Story = StoryObj<typeof ForgotPasswordForm>;

export const Default: Story = {};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset link' }));
    await waitFor(() => expect(canvas.getByText('Email is required.')).toBeInTheDocument());
  },
};

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Captured before submit — the loading state swaps the label for a
    // spinner, which can change the button's accessible name.
    const submitButton = canvas.getByRole('button', { name: 'Send reset link' });
    await userEvent.type(canvas.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'true'));
  },
};

export const Success: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^Email/), 'jane@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Send reset link' }));
    await waitFor(() =>
      expect(
        canvas.getByText('If an account exists for that email, a reset link is on its way.'),
      ).toBeInTheDocument(),
    );
  },
};
