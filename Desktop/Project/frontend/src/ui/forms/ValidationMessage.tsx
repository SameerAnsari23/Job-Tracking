import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';

export type ValidationTone = 'error' | 'warning' | 'success';

export interface ValidationMessageProps {
  tone?: ValidationTone;
  /** Ties the message to its field via aria-describedby. */
  id?: string;
  children: string;
}

const TONE_ICON: Record<ValidationTone, IconName> = {
  error: 'alert',
  warning: 'alert',
  success: 'check',
};

/**
 * Field/form message row (Phase 16.4): text-xs + tone icon so validation is
 * never color-only. Errors announce via role="alert" on first render; the
 * quieter tones use status semantics.
 */
export function ValidationMessage({ tone = 'error', id, children }: ValidationMessageProps) {
  const theme = useTheme();
  const s = theme.palette.mode === 'dark' ? semanticDark : semanticLight;
  const color = { error: s.errorText, warning: s.warningText, success: s.successText }[tone];

  return (
    <Box
      id={id}
      role={tone === 'error' ? 'alert' : 'status'}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        color,
        ...typeScale.textXs,
      }}
    >
      <Box component="span" sx={{ display: 'inline-flex', mt: '1px', flexShrink: 0 }}>
        <Icon name={TONE_ICON[tone]} size={14} />
      </Box>
      <span>{children}</span>
    </Box>
  );
}
