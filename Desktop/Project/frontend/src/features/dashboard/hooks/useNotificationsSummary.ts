import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

/**
 * Single query, shared by both the notification KPI count and the summary
 * widget's preview list — the backend has no separate unread-count
 * endpoint, and fetching the same list twice would be duplicated server
 * state (Phase 18.2 constraint).
 */
export function useNotificationsSummary() {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: dashboardApi.getNotifications,
  });
}
