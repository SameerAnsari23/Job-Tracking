import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLayout } from '@/ui/forms/FormLayout';
import { TextField } from '@/ui/forms/TextField';
import { PasswordField } from '@/ui/forms/PasswordField';
import { Checkbox } from '@/ui/forms/Checkbox';
import { ValidationMessage } from '@/ui/forms/ValidationMessage';
import { Button } from '@/ui/foundation/Button';
import type { ApiError } from '@/types/api.types';
import { signupSchema, type SignupFormValues } from '../schemas/signup.schema';
import { useSignup } from '../hooks/useSignup';

export interface SignupFormProps {
  onSuccess?: () => void;
}

const STRENGTH_HINTS: Record<0 | 1 | 2, string> = {
  0: 'Use at least 8 characters.',
  1: 'Add more characters, or mix letters, numbers, and symbols.',
  2: 'Add a number or symbol for a stronger password.',
};

/**
 * Advisory only — the backend enforces length (RegisterUseCase.ts,
 * WeakPasswordError), never a client-computed "strength". This purely
 * guides the user before submit.
 */
function computeStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const FIELD_NAMES = new Set(['email', 'password']);

export function SignupForm({ onSuccess }: SignupFormProps) {
  const signup = useSignup();
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const password = watch('password');
  const strength = computeStrength(password);
  const passwordField = register('password');

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signup.mutateAsync({ email: values.email, password: values.password });
      onSuccess?.();
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
        for (const detail of apiError.details) {
          if (FIELD_NAMES.has(detail.field)) {
            setError(detail.field as 'email' | 'password', { message: detail.message });
          }
        }
        return;
      }
      if (apiError.code === 'CONFLICT') {
        setError('email', { message: 'An account with this email address already exists.' });
        return;
      }
      if (apiError.code === 'WEAK_PASSWORD' || apiError.code === 'INVALID_EMAIL') {
        setError(apiError.code === 'WEAK_PASSWORD' ? 'password' : 'email', {
          message: apiError.message,
        });
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
      setServerError('Something went wrong. Please try again.');
    }
  });

  return (
    <FormLayout
      onSubmit={onSubmit}
      footer={
        <Button type="submit" fullWidth loading={signup.isPending}>
          Create account
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
        autoComplete="new-password"
        required
        strength={passwordTouched ? strength : undefined}
        strengthHint={passwordTouched ? STRENGTH_HINTS[Math.min(strength, 2) as 0 | 1 | 2] : undefined}
        error={errors.password?.message}
        {...passwordField}
        onBlur={(e) => {
          void passwordField.onBlur(e);
          setPasswordTouched(true);
        }}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Checkbox
        label="I agree to the Terms of Service and Privacy Policy"
        error={errors.acceptTerms?.message}
        {...register('acceptTerms')}
      />
    </FormLayout>
  );
}
