import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

/** The list endpoint has no total-count field — 50 is the backend's own max page size (Phase 18.2). */
const SAVED_JOBS_PAGE_LIMIT = 50;

export function useSavedJobsCount() {
  return useQuery({
    queryKey: ['jobs', 'saved', { limit: SAVED_JOBS_PAGE_LIMIT }],
    queryFn: () => dashboardApi.getSavedJobsPage(SAVED_JOBS_PAGE_LIMIT),
  });
}
