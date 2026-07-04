import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from '../api/discovery.api';

const PREFERENCES_KEY = ['discovery', 'preferences'];

/**
 * One mutation per existing endpoint, each invalidating the single shared
 * preferences query on success so every widget reading it — DiscoveryCard
 * list, status banner, automation/schedule summaries, watched companies —
 * updates together from the same refetch (Phase 18.3: no duplicated
 * discovery logic, one source of truth).
 */
export function usePauseDiscoveryProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => discoveryApi.pauseProfile(profileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}

export function useResumeDiscoveryProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => discoveryApi.resumeProfile(profileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}

export function useDeleteDiscoveryProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => discoveryApi.deleteProfile(profileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}

export function useActivateDiscovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => discoveryApi.activate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}

export function useDeactivateDiscovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => discoveryApi.deactivate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY }),
  });
}
