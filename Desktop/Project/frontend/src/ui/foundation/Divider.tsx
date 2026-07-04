import MuiDivider from '@mui/material/Divider';
import { Typography } from './Typography';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Vertical margin (horizontal dividers) or horizontal margin (vertical), in 4px grid units. */
  spacing?: number;
  /** Inline label — the auth "or" pattern. */
  label?: string;
}

/**
 * 1px neutral-200 rule (token-styled at the theme layer). Labeled form
 * renders the label in secondary label-sm between two rule segments.
 */
export function Divider({ orientation = 'horizontal', spacing = 0, label }: DividerProps) {
  return (
    <MuiDivider
      orientation={orientation}
      flexItem={orientation === 'vertical'}
      sx={orientation === 'horizontal' ? { my: spacing } : { mx: spacing }}
    >
      {label ? (
        <Typography variant="labelSm" color="secondary">
          {label}
        </Typography>
      ) : undefined}
    </MuiDivider>
  );
}
