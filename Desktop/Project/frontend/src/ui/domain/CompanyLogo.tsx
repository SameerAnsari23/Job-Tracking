import { forwardRef } from 'react';
import { Avatar } from '../foundation/Avatar';

export type CompanyLogoSize = 24 | 32 | 48;

export interface CompanyLogoProps {
  name: string;
  src?: string | null;
  size?: CompanyLogoSize;
}

/**
 * Company logo (Phase 16.4): image → initials on neutral-100 → generic
 * icon, fade-in on load. A thin `tone="neutral"` specialization of
 * foundation's Avatar rather than a reimplementation — the entire
 * fallback chain (image/initials/icon, broken-image recovery, fade-in)
 * already lives there and would otherwise be duplicated here.
 */
export const CompanyLogo = forwardRef<HTMLSpanElement, CompanyLogoProps>(function CompanyLogo(
  { name, src, size = 32 },
  ref,
) {
  return <Avatar ref={ref} name={name} src={src} size={size} tone="neutral" />;
});
