import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { SignupForm } from '../components/SignupForm';
import {
  registerSuccessHandler,
  registerConflictHandler,
  loginAcceptAnyHandler,
} from '../tests/mocks/authHandlers';

const meta: Meta<typeof SignupForm> = {
  title: 'Auth/SignupForm',
  component: SignupForm,
  decorators: [(Story) => <Box sx={{ maxWidth: 400 }}>{Story()}</Box>],
};
export default meta;

type Story = StoryObj<typeof SignupForm>;

const fillValid = async (canvas: ReturnType<typeof within>) => {
  await userEvent.type(canvas.getByLabelText(/^Email/), 'new.user@example.com');
  await userEvent.type(canvas.getByLabelText(/^Password/), 'a-strong-passw0rd!');
  await userEvent.type(canvas.getByLabelText(/^Confirm password/), 'a-strong-passw0rd!');
  await userEvent.click(canvas.getByRole('checkbox'));
};

export const Default: Story = {
  parameters: { msw: { handlers: [registerSuccessHandler, loginAcceptAnyHandler] } },
};

export const ValidationErrors: Story = {
  parameters: { msw: { handlers: [registerSuccessHandler, loginAcceptAnyHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(canvas.getByText('Email is required.')).toBeInTheDocument());
    expect(canvas.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    expect(canvas.getByText('You must accept the terms to continue.')).toBeInTheDocument();
  },
};

export const PasswordStrengthMeter: Story = {
  parameters: { msw: { handlers: [registerSuccessHandler, loginAcceptAnyHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText(/^Password/);
    await userEvent.type(password, 'weak');
    await userEvent.tab();
    await waitFor(() => expect(canvas.getByRole('meter')).toBeInTheDocument());
  },
};

export const Loading: Story = {
  parameters: { msw: { handlers: [registerSuccessHandler, loginAcceptAnyHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Captured before submit — see LoginForm.stories.tsx's Loading story
    // for why re-querying by name mid-flight would not find it.
    const submitButton = canvas.getByRole('button', { name: 'Create account' });
    await fillValid(canvas);
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toHaveAttribute('aria-busy', 'true'));
  },
};

export const Success: Story = {
  parameters: { msw: { handlers: [registerSuccessHandler, loginAcceptAnyHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.getByRole('button', { name: 'Create account' });
    await fillValid(canvas);
    await userEvent.click(submitButton);
    await waitFor(() => expect(submitButton).not.toHaveAttribute('aria-busy'));
  },
};

export const EmailConflict: Story = {
  parameters: { msw: { handlers: [registerConflictHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await fillValid(canvas);
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await waitFor(() =>
      expect(
        canvas.getByText('An account with this email address already exists.'),
      ).toBeInTheDocument(),
    );
  },
};
