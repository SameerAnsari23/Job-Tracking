import { Link as RouterLink } from 'react-router-dom';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { Link } from '@/ui/foundation/Link';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

/** Only routed when the `passwordReset` flag is enabled — see src/routes/index.tsx. */
export function ForgotPasswordPage() {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Typography variant="h3" as="h1">
          Forgot password
        </Typography>
        <Typography variant="textSm" color="secondary">
          We'll send you a link to reset it.
        </Typography>
      </Stack>

      <ForgotPasswordForm />

      <Stack direction="row" justify="center">
        <Link href="/login" routerComponent={RouterLink}>
          Back to sign in
        </Link>
      </Stack>
    </Stack>
  );
}
