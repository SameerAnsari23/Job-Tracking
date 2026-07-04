import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDiscoverySummary() {
  return useQuery({
    queryKey: ['discovery', 'preferences'],
    queryFn: dashboardApi.getDiscoverySummary,
  });
}
