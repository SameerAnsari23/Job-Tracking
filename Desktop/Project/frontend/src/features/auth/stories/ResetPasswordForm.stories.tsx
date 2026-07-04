import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

/** SCAFFOLD (Phase 18.0) — see ForgotPasswordForm.stories.tsx for the same rationale. */
const meta: Meta<typeof ResetPasswordForm> = {
  title: 'Auth/ResetPasswordForm',
  component: ResetPasswordForm,
  decorators: [(Story) => <Box sx={{ maxWidth: 400 }}>{Story()}</Box>],
};
export default meta;

type Story = StoryObj<typeof ResetPasswordForm>;

export const Default: Story = {
  args: { token: 'valid-reset-token' },
};

export const InvalidLink: Story = {
  args: { token: null },
};

export const ValidationError: Story = {
  args: { token: 'valid-reset-token' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }));
    await waitFor(() =>
      expect(canvas.getByText('Password must be at least 8 characters.')).toBeInTheDocument(),
    );
  },
};

export const PasswordMismatch: Story = {
  args: { token: 'valid-reset-token' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^New password/), 'a-strong-passw0rd!');
    await userEvent.type(canvas.getByLabelText(/^Confirm new password/), 'a-different-one!');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }));
    await waitFor(() => expect(canvas.getByText('Passwords do not match.')).toBeInTheDocument());
  },
};

export const Loading: Story = {
  args: { token: 'valid-reset-token' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Captured before submit — the loading state swaps the label for a
    // spinner, which can change the button's accessible name.
    const submitButton = canvas.getByRole('button', { name: 'Reset password' });
    await userEvent.type(canvas.getByLabelText(/^New password/), 'a-strong-passw0rd!');
    await userEvent.type(canvas.getByLabelText(/^Confirm new password/), 'a-strong-passw0rd!');
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'true'));
  },
};

export const Success: Story = {
  args: { token: 'valid-reset-token' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^New password/), 'a-strong-passw0rd!');
    await userEvent.type(canvas.getByLabelText(/^Confirm new password/), 'a-strong-passw0rd!');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }));
    await waitFor(() =>
      expect(
        canvas.getByText('Your password has been reset. You can now sign in.'),
      ).toBeInTheDocument(),
    );
  },
};
