import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLayout } from '@/ui/forms/FormLayout';
import { TextField } from '@/ui/forms/TextField';
import { PasswordField } from '@/ui/forms/PasswordField';
import { ValidationMessage } from '@/ui/forms/ValidationMessage';
import { Button } from '@/ui/foundation/Button';
import type { ApiError } from '@/types/api.types';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';

export interface LoginFormProps {
  onSuccess?: () => void;
}

const FIELD_NAMES = new Set(['email', 'password']);

/**
 * The backend's LoginUseCase returns one INVALID_CREDENTIALS message for
 * every failure mode (bad format, unknown email, wrong password) as a
 * deliberate timing-oracle defense. The frontend must never try to
 * distinguish these — one generic message, always.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
      onSuccess?.();
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
        for (const detail of apiError.details) {
          if (FIELD_NAMES.has(detail.field)) {
            setError(detail.field as keyof LoginFormValues, { message: detail.message });
          }
        }
        return;
      }
      if (apiError.code === 'RATE_LIMITED') {
        setServerError('Too many attempts. Please wait a moment and try again.');
        return;
      }
      if (apiError.code === 'NETWORK') {
        setServerError('Connection failed. Check your internet connection.');
        return;
      }
      setServerError('Incorrect email or password.');
    }
  });

  return (
    <FormLayout
      onSubmit={onSubmit}
      footer={
        <Button type="submit" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      }
    >
      {serverError && <ValidationMessage>{serverError}</ValidationMessage>}
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordField
        label="Password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
    </FormLayout>
  );
}
