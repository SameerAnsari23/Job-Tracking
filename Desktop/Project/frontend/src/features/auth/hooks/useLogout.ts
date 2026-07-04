import { useMutation, useQueryClient } from '@tanstack/react-query';
import { performLogout } from '../services/logout.service';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: performLogout,
    onSettled: () => {
      // Wipe every cached server response — none of it belongs to whatever
      // session lands in this browser next.
      queryClient.clear();
    },
  });
}
