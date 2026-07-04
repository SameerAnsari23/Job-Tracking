import { Surface } from '@/ui/foundation/Surface';
import { EmptyState } from '@/ui/layout/EmptyState';
import { useDiscoveryPreferences } from '../hooks/useDiscoveryPreferences';

/**
 * A prominent, page-level banner shown only when the user truly has no
 * discovery profiles yet — distinct from DiscoveryProfilesWidget's own
 * (terser) empty state. No call-to-action button: profile creation is a
 * multi-field form outside this phase's scope, so this stays informational
 * rather than linking to something that doesn't exist yet.
 */
export function OnboardingGuidance() {
  const { data, isLoading, isError } = useDiscoveryPreferences();

  if (isLoading || isError || !data || data.profiles.length > 0) return null;

  return (
    <Surface level="raised" padding={8} as="section">
      <EmptyState
        icon="radar"
        title="Set up discovery to get matched automatically"
        description="Discovery profiles watch companies and roles for you, so new matches surface here without manual searching. Profile creation is coming soon."
      />
    </Surface>
  );
}
