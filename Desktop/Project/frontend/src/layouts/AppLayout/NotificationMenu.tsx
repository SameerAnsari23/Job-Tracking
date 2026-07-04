import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { Icon } from '@/ui/foundation/Icon';
import { Tooltip } from '@/ui/foundation/Tooltip';
import { Link } from '@/ui/foundation/Link';
import { Drawer } from '@/ui/layout/Drawer';
import { EmptyState } from '@/ui/layout/EmptyState';

/**
 * Notification bell + drawer shell (Phase 18.1 placeholder). No unread
 * count is shown — there is no real data source yet, and a fabricated
 * number would be worse than none. The Notifications feature phase wires
 * the real badge count and list into this same drawer.
 */
export function NotificationMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip content="Notifications">
        <IconButton aria-label="Notifications" onClick={() => setOpen(true)}>
          <Icon name="bell" size={18} />
        </IconButton>
      </Tooltip>
      <Drawer open={open} onClose={() => setOpen(false)} side="right" title="Notifications">
        <EmptyState
          icon="bell"
          title="No notifications yet"
          description="You'll see job matches and account updates here."
          action={
            <Link href="/notifications" routerComponent={RouterLink}>
              Go to Notifications
            </Link>
          }
        />
      </Drawer>
    </>
  );
}
