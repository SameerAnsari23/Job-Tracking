import { forwardRef, useId } from 'react';
import type { ChangeEventHandler } from 'react';
import Box from '@mui/material/Box';
import MuiSwitch from '@mui/material/Switch';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  semanticLight,
  semanticDark,
  duration,
  easing,
  typeScale,
} from '@/theme';

export type SaveState = 'saving' | 'saved' | 'error' | null;

export interface SwitchProps {
  label: string;
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  labelPlacement?: 'start' | 'end';
  /** Secondary line under the label. */
  description?: string;
  /**
   * Inline auto-save indicator (Settings pattern, Phase 16.3 §1.8):
   * 'saving' → subtle text · 'saved' → "Saved ✓" · 'error' → revert message.
   */
  saveState?: SaveState;
}

/**
 * 36×20 toggle per Phase 16.2: neutral-200 track off, accent-500 on, white
 * thumb, 150ms transition. role="switch" comes from the native input.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    id: idProp,
    name,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    labelPlacement = 'end',
    description,
    saveState = null,
  },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const s = dark ? semanticDark : semanticLight;
  const autoId = useId();
  const id = idProp ?? autoId;

  const control = (
    <MuiSwitch
      id={id}
      name={name}
      inputRef={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      disabled={disabled}
      disableRipple
      inputProps={{ role: 'switch' }}
      sx={{
        width: 36,
        height: 20,
        p: 0,
        '& .MuiSwitch-switchBase': {
          p: '2px',
          transitionDuration: `${duration.fast}ms`,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            '& + .MuiSwitch-track': { backgroundColor: a[500], opacity: 1 },
          },
        },
        '& .MuiSwitch-thumb': {
          width: 16,
          height: 16,
          boxShadow: 'none',
          backgroundColor: '#FFFFFF',
        },
        '& .MuiSwitch-track': {
          borderRadius: 10,
          backgroundColor: n[200],
          opacity: 1,
          transition: `background-color ${duration.fast}ms ${easing.easeOut}`,
        },
      }}
    />
  );

  const labelBlock = (
    <Box>
      <Box
        component="label"
        htmlFor={id}
        sx={{
          ...typeScale.textBase,
          color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
        }}
      >
        {label}
      </Box>
      {description && (
        <Box sx={{ ...typeScale.textSm, color: theme.palette.text.secondary }}>{description}</Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {labelPlacement === 'start' && labelBlock}
      {control}
      {labelPlacement === 'end' && labelBlock}
      {saveState && (
        <Box
          role="status"
          sx={{
            ...typeScale.textXs,
            color:
              saveState === 'saved'
                ? s.successText
                : saveState === 'error'
                  ? s.errorText
                  : theme.palette.text.secondary,
            ml: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Couldn’t save'}
        </Box>
      )}
    </Box>
  );
});
