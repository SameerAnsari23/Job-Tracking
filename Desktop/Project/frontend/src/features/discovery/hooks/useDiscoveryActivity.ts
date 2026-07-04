import { useQuery } from '@tanstack/react-query';
import { discoveryApi } from '../api/discovery.api';

const ACTIVITY_LIMIT = 5;

/**
 * Deliberately a SEPARATE query (different endpoint, different key) from
 * useDiscoveryPreferences — this is the independence boundary the backend
 * actually supports: a failure/slow response here never affects the
 * preferences-derived widgets, and vice versa (Phase 18.3 "one widget
 * failure does not affect other widgets").
 */
export function useDiscoveryActivity() {
  return useQuery({
    queryKey: ['jobs', 'recommendations', { limit: ACTIVITY_LIMIT }],
    queryFn: () => discoveryApi.getRecentMatches(ACTIVITY_LIMIT),
  });
}
