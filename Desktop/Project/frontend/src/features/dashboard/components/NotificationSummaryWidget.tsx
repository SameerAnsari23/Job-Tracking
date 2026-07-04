import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Widget } from '@/ui/layout/Widget';
import { EmptyState } from '@/ui/layout/EmptyState';
import { NotificationItem } from '@/ui/data-display/NotificationItem';
import { Link } from '@/ui/foundation/Link';
import type { IconName } from '@/ui/foundation/Icon';
import { useNotificationsSummary } from '../hooks/useNotificationsSummary';
import { formatRelativeTime } from './internal/formatRelativeTime';

const PREVIEW_COUNT = 5;

const TYPE_ICON: Record<string, IconName> = {
  NEW_MATCH: 'radar',
  DAILY_DIGEST: 'mail',
  WEEKLY_DIGEST: 'mail',
  APPLICATION_UPDATE: 'briefcase',
};

/**
 * Read-only preview (Phase 18.2): marking read/deleting is Notifications
 * feature territory. Clicking a row navigates to /notifications rather
 * than mutating anything here.
 */
export function NotificationSummaryWidget() {
  const { data, isLoading, isError, error, refetch } = useNotificationsSummary();
  const navigate = useNavigate();

  const preview = (data ?? []).slice(0, PREVIEW_COUNT);

  return (
    <Widget
      title="Notifications"
      action={
        <Link href="/notifications" routerComponent={RouterLink}>
          View all
        </Link>
      }
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load notifications.' : null}
      onRetry={() => {
        void refetch();
      }}
      empty={data !== undefined && data.length === 0}
      emptyState={<EmptyState icon="bell" title="No notifications yet" />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {preview.map((notification) => (
          <NotificationItem
            key={notification.id}
            density="drawer"
            notification={{
              id: notification.id,
              icon: TYPE_ICON[notification.type] ?? 'bell',
              title: notification.title,
              body: notification.message,
              timestamp: formatRelativeTime(notification.createdAt),
              read: notification.isRead,
            }}
            onNavigate={() => navigate('/notifications')}
          />
        ))}
      </Box>
    </Widget>
  );
}
