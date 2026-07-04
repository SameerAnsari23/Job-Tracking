import { Badge } from '../foundation/Badge';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'TEMPORARY'
  | 'VOLUNTEER'
  | 'UNKNOWN';

export interface EmploymentTypeBadgeProps {
  type: EmploymentType;
  /** Overrides the built-in label — the "custom" case in the spec. */
  label?: string;
}

const LABEL: Record<Exclude<EmploymentType, 'UNKNOWN'>, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary',
  VOLUNTEER: 'Volunteer',
};

/**
 * Employment-type badge (Phase 16.4): maps the backend enum to a display
 * label. UNKNOWN renders nothing UNLESS a custom `label` is supplied —
 * the one supported escape hatch for a source that doesn't fit the enum.
 */
export function EmploymentTypeBadge({ type, label }: EmploymentTypeBadgeProps) {
  const text = label ?? (type === 'UNKNOWN' ? null : LABEL[type]);
  if (!text) return null;
  return <Badge tone="neutral">{text}</Badge>;
}
