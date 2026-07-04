import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { Link } from '@/ui/foundation/Link';
import { isEnabled } from '@/app/flags';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Typography variant="h3" as="h1">
          Sign in
        </Typography>
        <Typography variant="textSm" color="secondary">
          Welcome back — enter your details to continue.
        </Typography>
      </Stack>

      <LoginForm onSuccess={() => navigate(from, { replace: true })} />

      <Stack direction="row" justify="between" align="center">
        {isEnabled('passwordReset') ? (
          <Link href="/forgot-password" variant="subtle" routerComponent={RouterLink}>
            Forgot password?
          </Link>
        ) : (
          <span />
        )}
        <Link href="/signup" routerComponent={RouterLink}>
          Create an account
        </Link>
      </Stack>
    </Stack>
  );
}
