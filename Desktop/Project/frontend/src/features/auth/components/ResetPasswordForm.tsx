import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLayout } from '@/ui/forms/FormLayout';
import { PasswordField } from '@/ui/forms/PasswordField';
import { ValidationMessage } from '@/ui/forms/ValidationMessage';
import { Button } from '@/ui/foundation/Button';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/resetPassword.schema';
import { useResetPassword } from '../hooks/useResetPassword';

export interface ResetPasswordFormProps {
  /** Extracted from the reset link's query string by the page; router-agnostic here. */
  token: string | null;
  onSuccess?: () => void;
}

/**
 * SCAFFOLD (Phase 18.0) — no backend endpoint exists for completing a
 * password reset. Only mounted behind the `passwordReset` feature flag
 * (default OFF). See hooks/useResetPassword.ts.
 */
export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const resetPassword = useResetPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    await resetPassword.mutateAsync({ ...values, token });
    setSubmitted(true);
    onSuccess?.();
  });

  if (!token) {
    return (
      <ValidationMessage>
        This password reset link is invalid or has expired. Request a new one.
      </ValidationMessage>
    );
  }

  if (submitted) {
    return (
      <ValidationMessage tone="success">
        Your password has been reset. You can now sign in.
      </ValidationMessage>
    );
  }

  return (
    <FormLayout
      onSubmit={onSubmit}
      footer={
        <Button type="submit" fullWidth loading={resetPassword.isPending}>
          Reset password
        </Button>
      }
    >
      <PasswordField
        label="New password"
        autoComplete="new-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordField
        label="Confirm new password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
    </FormLayout>
  );
}
