import { PageHeader } from '@/ui/navigation/PageHeader';

interface Props {
  title: string;
  /** Blueprint milestone that will replace this placeholder. */
  phase: string;
}

/**
 * Bootstrap placeholder for every route. Real pages replace these
 * milestone by milestone (blueprint Phases I–P); no business logic here.
 * Rendered inside the shell's own page Container (AppLayout, Phase 18.1) —
 * this component owns no outer padding/max-width of its own.
 */
export function PlaceholderPage({ title, phase }: Props) {
  return <PageHeader title={title} description={`Placeholder page — implemented in blueprint ${phase}.`} />;
}
