import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLayout } from '@/ui/forms/FormLayout';
import { TextField } from '@/ui/forms/TextField';
import { ValidationMessage } from '@/ui/forms/ValidationMessage';
import { Button } from '@/ui/foundation/Button';
import { Typography } from '@/ui/foundation/Typography';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgotPassword.schema';
import { useForgotPassword } from '../hooks/useForgotPassword';

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

/**
 * SCAFFOLD (Phase 18.0) — no backend endpoint exists for password-reset
 * requests. Only mounted behind the `passwordReset` feature flag (default
 * OFF). See hooks/useForgotPassword.ts.
 */
export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const forgotPassword = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await forgotPassword.mutateAsync(values);
    setSubmitted(true);
    onSuccess?.();
  });

  if (submitted) {
    return (
      <ValidationMessage tone="success">
        If an account exists for that email, a reset link is on its way.
      </ValidationMessage>
    );
  }

  return (
    <FormLayout
      onSubmit={onSubmit}
      footer={
        <Button type="submit" fullWidth loading={forgotPassword.isPending}>
          Send reset link
        </Button>
      }
    >
      <Typography variant="textSm" color="secondary">
        Enter the email address associated with your account.
      </Typography>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        error={errors.email?.message}
        {...register('email')}
      />
    </FormLayout>
  );
}
