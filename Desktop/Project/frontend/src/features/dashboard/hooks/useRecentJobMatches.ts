import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

const RECENT_MATCHES_LIMIT = 5;

export function useRecentJobMatches() {
  return useQuery({
    queryKey: ['jobs', 'recommendations', { limit: RECENT_MATCHES_LIMIT }],
    queryFn: () => dashboardApi.getRecentJobMatches(RECENT_MATCHES_LIMIT),
  });
}
