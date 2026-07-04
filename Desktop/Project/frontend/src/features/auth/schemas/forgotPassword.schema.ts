import { z } from 'zod';

/** SCAFFOLD — see hooks/useForgotPassword.ts for why this has no backend call yet. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
