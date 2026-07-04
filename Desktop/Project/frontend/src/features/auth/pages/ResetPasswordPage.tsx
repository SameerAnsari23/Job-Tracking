import { useNavigate, useSearchParams } from 'react-router-dom';
import { Stack } from '@/ui/layout/Stack';
import { Typography } from '@/ui/foundation/Typography';
import { ResetPasswordForm } from '../components/ResetPasswordForm';

/** Only routed when the `passwordReset` flag is enabled — see src/routes/index.tsx. */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Typography variant="h3" as="h1">
          Reset password
        </Typography>
        <Typography variant="textSm" color="secondary">
          Choose a new password for your account.
        </Typography>
      </Stack>

      <ResetPasswordForm
        token={token}
        onSuccess={() => navigate('/login', { replace: true })}
      />
    </Stack>
  );
}
