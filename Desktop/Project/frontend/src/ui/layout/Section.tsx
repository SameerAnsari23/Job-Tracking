import { forwardRef, useId } from 'react';
import type { ElementType, ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '../foundation/Typography';
import { Stack } from './Stack';

export interface SectionProps {
  title: string;
  /** Right-aligned header action ("View all →" ghost link/button). */
  action?: ReactNode;
  description?: string;
  /**
   * Semantic heading level for `title` — visual size (h5) is unaffected;
   * only the DOCUMENT heading level changes. Defaults to h5 (this
   * component's original behavior). Override when composing several
   * Sections/Widgets together so their heading levels stay consistent
   * siblings instead of skipping a level.
   */
  titleAs?: ElementType;
  children: ReactNode;
}

/**
 * Page content band (Phase 16.4): h5 title + optional action row, semantic
 * <section aria-labelledby>. Separation between Sections belongs to the
 * parent Stack (space-12), not to the Section itself.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { title, action, description, titleAs, children },
  ref,
) {
  const headingId = useId();

  return (
    <Box component="section" ref={ref} aria-labelledby={headingId}>
      <Stack gap={4}>
        <Stack direction="row" align="center" justify="between" gap={4}>
          <Stack gap={1}>
            <Typography variant="h5" as={titleAs} id={headingId}>
              {title}
            </Typography>
            {description && (
              <Typography variant="textSm" color="secondary">
                {description}
              </Typography>
            )}
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
});
