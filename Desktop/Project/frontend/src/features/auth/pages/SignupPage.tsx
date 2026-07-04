import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { Link } from '@/ui/foundation/Link';
import { SignupForm } from '../components/SignupForm';

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Typography variant="h3" as="h1">
          Create your account
        </Typography>
        <Typography variant="textSm" color="secondary">
          Start getting notified about jobs that match your profile.
        </Typography>
      </Stack>

      <SignupForm onSuccess={() => navigate('/dashboard', { replace: true })} />

      <Stack direction="row" justify="center">
        <Typography variant="textSm" color="secondary">
          Already have an account?{' '}
          <Link href="/login" routerComponent={RouterLink}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
}
