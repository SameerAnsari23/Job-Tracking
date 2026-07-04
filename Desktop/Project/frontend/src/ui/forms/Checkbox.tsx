import { forwardRef, useId } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, neutralLight, neutralDark, radius, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import { ValidationMessage } from './ValidationMessage';

export interface CheckboxProps {
  label: string;
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  indeterminate?: boolean;
  disabled?: boolean;
  error?: string;
  /** Secondary line under the label. */
  description?: string;
}

/**
 * Custom 16px checkbox per Phase 16.2: 1.5px neutral-300 border unchecked,
 * accent fill + white check when checked. Built on MUI Checkbox (native
 * input semantics, keyboard, forwarded ref for RHF register()).
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    id: idProp,
    name,
    checked,
    defaultChecked,
    onChange,
    onBlur,
    indeterminate = false,
    disabled = false,
    error,
    description,
  },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = error ? `${id}-error` : undefined;

  const box = (filled: boolean, mark: 'check' | 'minus' | null) => (
    <Box
      component="span"
      sx={{
        width: 16,
        height: 16,
        borderRadius: `${radius.sm}px`,
        border: filled ? 'none' : `1.5px solid ${error ? theme.palette.error.main : n[300]}`,
        backgroundColor: filled ? a[500] : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: a.foreground,
      }}
    >
      {mark === 'check' && <Icon name="check" size={14} />}
      {mark === 'minus' && (
        <Box component="span" sx={{ width: 8, height: 1.5, backgroundColor: 'currentColor' }} />
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <MuiCheckbox
          id={id}
          name={name}
          inputRef={ref}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          indeterminate={indeterminate}
          disabled={disabled}
          icon={box(false, null)}
          checkedIcon={box(true, 'check')}
          indeterminateIcon={box(true, 'minus')}
          inputProps={{
            'aria-invalid': error ? true : undefined,
            'aria-describedby': errorId,
            // Blur belongs to the native input (RHF touched-state tracking),
            // not MUI's ButtonBase wrapper.
            onBlur,
          }}
          sx={{ p: 0.5, mt: '1px' }}
        />
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
            <Box sx={{ ...typeScale.textSm, color: theme.palette.text.secondary }}>
              {description}
            </Box>
          )}
        </Box>
      </Box>
      {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
    </Box>
  );
});
