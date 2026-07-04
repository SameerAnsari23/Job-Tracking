import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '../foundation/Typography';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Titled field group (Phase 16.4): fieldset/legend semantics, h5 title,
 * 24px internal stack gap. Sections are separated by FormLayout's 32px gap.
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Box
      component="fieldset"
      sx={{ border: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <Box component="legend" sx={{ p: 0, mb: description ? 0 : 2 }}>
        <Typography variant="h5" as="span">
          {title}
        </Typography>
      </Box>
      {description && (
        <Typography variant="textSm" color="secondary">
          {description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</Box>
    </Box>
  );
}
