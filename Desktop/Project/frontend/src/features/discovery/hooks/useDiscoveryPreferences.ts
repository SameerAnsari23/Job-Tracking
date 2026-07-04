import { useQuery } from '@tanstack/react-query';
import { discoveryApi } from '../api/discovery.api';

/**
 * The backend exposes discovery profiles, watched companies, automation
 * status, and schedule settings through exactly ONE endpoint (GET
 * /discovery) — there is no way to fetch "just watched companies"
 * independently. Every widget sourced from this data calls this SAME hook;
 * TanStack Query dedupes it into a single network request and a single
 * shared cache entry, so multiple widgets reading it is cache reuse, not
 * duplicated server state.
 */
export function useDiscoveryPreferences() {
  return useQuery({
    queryKey: ['discovery', 'preferences'],
    queryFn: discoveryApi.getPreferences,
  });
}
