import { forwardRef, useId, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import { semanticLight, semanticDark, neutralLight, neutralDark, radius, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  'type' | 'iconStart' | 'iconEnd' | 'inputMode' | 'inputProps'
> {
  /**
   * Advisory strength (0–3) computed by the FORM, not this component —
   * backend only enforces length, the meter guides. Renders only when
   * defined; forms show it after first blur (Phase 16.3).
   */
  strength?: 0 | 1 | 2 | 3;
  /** One line of advice under the meter ("Add a number or symbol"). */
  strengthHint?: string;
}

const HEIGHT = { sm: 36, md: 40, lg: 44 } as const;

/**
 * TextField + visibility toggle (aria-pressed, its own focus stop) and an
 * optional 3-segment advisory strength meter.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    {
      label,
      hiddenLabel,
      id: idProp,
      name,
      value,
      defaultValue,
      onChange,
      onBlur,
      onKeyDown,
      placeholder,
      required,
      disabled,
      size = 'md',
      autoComplete = 'current-password',
      autoFocus,
      maxLength,
      strength,
      strengthHint,
      helperText,
      error,
      warning,
      success,
    },
    ref,
  ) {
    const theme = useTheme();
    const dark = theme.palette.mode === 'dark';
    const s = dark ? semanticDark : semanticLight;
    const n = dark ? neutralDark : neutralLight;

    const autoId = useId();
    const id = idProp ?? autoId;
    const [visible, setVisible] = useState(false);
    const messages = { helperText, error, warning, success };

    const segmentColors = [s.errorText, s.warningText, s.successText] as const;

    return (
      <FieldWrapper
        id={id}
        label={label}
        hiddenLabel={hiddenLabel}
        required={required}
        disabled={disabled}
        {...messages}
      >
        <OutlinedInput
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          inputRef={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={Boolean(error)}
          fullWidth
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputProps={{ maxLength, ...fieldAria(id, messages, required) }}
          data-size={size}
          sx={{ height: HEIGHT[size] }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
                disabled={disabled}
                edge="end"
                size="small"
              >
                <Icon name={visible ? 'eyeOff' : 'eye'} size={16} />
              </IconButton>
            </InputAdornment>
          }
        />
        {strength !== undefined && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              role="meter"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={strength}
              aria-label="Password strength"
              sx={{ display: 'flex', gap: 1 }}
            >
              {[0, 1, 2].map((seg) => (
                <Box
                  key={seg}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: `${radius.full}px`,
                    backgroundColor:
                      strength > seg ? segmentColors[Math.min(strength - 1, 2)] : n[200],
                  }}
                />
              ))}
            </Box>
            {strengthHint && (
              <Box sx={{ ...typeScale.textXs, color: theme.palette.text.secondary }}>
                {strengthHint}
              </Box>
            )}
          </Box>
        )}
      </FieldWrapper>
    );
  },
);
