import { Link as RouterLink } from 'react-router-dom';
import { Widget } from '@/ui/layout/Widget';
import { ProfileStrength } from '@/ui/domain/ProfileStrength';
import { Link } from '@/ui/foundation/Link';
import { useProfileSummary } from '../hooks/useProfileSummary';

/**
 * Reuses the domain-tier ProfileStrength component wholesale (Phase 17.7) —
 * this widget only supplies the score and a checklist computed from real
 * profile fields, never a fabricated one.
 */
export function OnboardingProgressWidget() {
  const { data, isLoading, isError, error, refetch } = useProfileSummary();

  const checklist = data
    ? [
        { label: 'Add a headline', done: Boolean(data.headline) },
        { label: 'Add skills', done: data.skills.length > 0 },
        { label: 'Add experience', done: data.experience.length > 0 },
        { label: 'Upload a resume', done: Boolean(data.resumeMetadata) },
        { label: 'Set target roles', done: data.jobSearchPreferences.targetTitles.length > 0 },
      ]
    : undefined;

  return (
    <Widget
      title="Onboarding"
      loading={isLoading}
      error={isError ? (error as Error).message || 'Could not load your profile.' : null}
      onRetry={() => {
        void refetch();
      }}
    >
      {data && (
        <ProfileStrength
          score={data.completionScore}
          checklist={checklist}
          recommendationsSlot={
            data.completionScore < 100 ? (
              <Link href="/profile" routerComponent={RouterLink}>
                Complete your profile
              </Link>
            ) : undefined
          }
        />
      )}
    </Widget>
  );
}
