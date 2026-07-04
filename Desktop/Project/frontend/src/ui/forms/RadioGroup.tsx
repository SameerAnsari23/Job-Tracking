import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import MuiRadio from '@mui/material/Radio';
import MuiRadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark, typeScale } from '@/theme';
import { ValidationMessage } from './ValidationMessage';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group label — rendered as the fieldset legend. */
  label: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  error?: string;
  row?: boolean;
}

/**
 * Radios exist ONLY inside a group (Phase 16.4): fieldset/legend semantics,
 * roving tabindex + arrow-key navigation via the native radio pattern.
 * Custom 16px circle indicators per the 16.2 control spec.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { label, options, value, defaultValue, onChange, name, disabled = false, error, row = false },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;

  const circle = (filled: boolean) => (
    <Box
      component="span"
      sx={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: filled
          ? `5px solid ${a[500]}`
          : `1.5px solid ${error ? theme.palette.error.main : n[300]}`,
        backgroundColor: filled ? a.foreground : 'transparent',
        boxSizing: 'border-box',
      }}
    />
  );

  return (
    <Box
      component="fieldset"
      sx={{ border: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box
        component="legend"
        sx={{
          ...typeScale.textSm,
          fontWeight: 500,
          color: theme.palette.text.primary,
          p: 0,
          mb: 1,
        }}
      >
        {label}
      </Box>
      <MuiRadioGroup
        ref={ref}
        row={row}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={(_, v) => onChange?.(v)}
        aria-describedby={errorId}
        sx={{ gap: row ? 4 : 1.5 }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            disabled={disabled || option.disabled}
            control={<MuiRadio icon={circle(false)} checkedIcon={circle(true)} sx={{ p: 0.5 }} />}
            sx={{ m: 0, gap: 2, alignItems: 'flex-start' }}
            label={
              <Box>
                <Box component="span" sx={{ ...typeScale.textBase, display: 'block' }}>
                  {option.label}
                </Box>
                {option.description && (
                  <Box sx={{ ...typeScale.textSm, color: theme.palette.text.secondary }}>
                    {option.description}
                  </Box>
                )}
              </Box>
            }
          />
        ))}
      </MuiRadioGroup>
      {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
    </Box>
  );
});
