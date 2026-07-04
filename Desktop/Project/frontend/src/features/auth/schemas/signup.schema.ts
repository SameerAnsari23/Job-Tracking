import { z } from 'zod';

/**
 * The router-level backend schema only requires min(1) — the effective
 * 8-character minimum is a RegisterUseCase.ts business rule (WeakPasswordError),
 * not a schema rule. We mirror the business rule here for upfront UX; the
 * backend remains the source of truth and is still the final gate.
 */
export const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    acceptTerms: z
      .boolean()
      .refine((v) => v, { message: 'You must accept the terms to continue.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
