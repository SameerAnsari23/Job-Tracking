import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Widget } from '@/ui/layout/Widget';
import { Button } from '@/ui/foundation/Button';
import { Icon } from '@/ui/foundation/Icon';

const ACTIONS = [
  { label: 'Search jobs', path: '/jobs', icon: 'search' },
  { label: 'View discovery', path: '/discovery', icon: 'radar' },
  { label: 'Saved jobs', path: '/jobs/saved', icon: 'bookmark' },
  { label: 'Update profile', path: '/profile', icon: 'user' },
] as const;

/** Pure navigation shortcuts — no data, no mutations. */
export function QuickActionsWidget() {
  const navigate = useNavigate();

  return (
    <Widget title="Quick Actions">
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr 1fr' } }}>
        {ACTIONS.map((action) => (
          <Button
            key={action.path}
            variant="secondary"
            iconStart={<Icon name={action.icon} size={16} />}
            onClick={() => navigate(action.path)}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Widget>
  );
}
