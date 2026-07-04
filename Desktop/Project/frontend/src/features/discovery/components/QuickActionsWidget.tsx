import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Widget } from '@/ui/layout/Widget';
import { Button } from '@/ui/foundation/Button';
import { Icon } from '@/ui/foundation/Icon';

const ACTIONS = [
  { label: 'View matches', path: '/jobs', icon: 'briefcase' },
  { label: 'Saved jobs', path: '/jobs/saved', icon: 'bookmark' },
  { label: 'Notifications', path: '/notifications', icon: 'bell' },
] as const;

/** Pure navigation shortcuts — no data, no mutations. */
export function QuickActionsWidget() {
  const navigate = useNavigate();

  return (
    <Widget title="Quick Actions">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ACTIONS.map((action) => (
          <Button
            key={action.path}
            variant="secondary"
            fullWidth
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
