import { Badge } from '../foundation/Badge';

export type WorkplaceType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export interface WorkplaceBadgeProps {
  type: WorkplaceType;
}

const LABEL: Record<WorkplaceType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

/**
 * Workplace-type badge (Phase 16.4): REMOTE is the differentiator users
 * scan for, so it alone gets the accent tone; HYBRID/ONSITE are neutral.
 */
export function WorkplaceBadge({ type }: WorkplaceBadgeProps) {
  return <Badge tone={type === 'REMOTE' ? 'accent' : 'neutral'}>{LABEL[type]}</Badge>;
}
