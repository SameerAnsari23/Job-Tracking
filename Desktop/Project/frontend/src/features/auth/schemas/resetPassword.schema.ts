import { z } from 'zod';

/** SCAFFOLD — see hooks/useResetPassword.ts for why this has no backend call yet. */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must not exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
