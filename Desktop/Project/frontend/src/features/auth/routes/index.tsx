import type { RouteObject } from 'react-router-dom';
import { isEnabled } from '@/app/flags';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

/**
 * The auth feature's own path-to-page mapping, spliced into the main route
 * tree under GuestRoute > AuthLayout (src/routes/index.tsx). Forgot/reset
 * password stay excluded from the tree entirely unless the `passwordReset`
 * flag is on — no backend endpoint exists for them yet.
 */
export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  ...(isEnabled('passwordReset')
    ? [
        { path: '/forgot-password', element: <ForgotPasswordPage /> },
        { path: '/reset-password', element: <ResetPasswordPage /> },
      ]
    : []),
];
