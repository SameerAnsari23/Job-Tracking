import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useProfileSummary() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: dashboardApi.getProfileSummary,
  });
}
