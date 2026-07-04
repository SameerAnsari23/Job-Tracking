import { forwardRef, useId } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';
import type { FieldSize } from './TextField';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: FieldSize;
}

const HEIGHT: Record<FieldSize, number> = { sm: 36, md: 40, lg: 44 };

/**
 * Single-choice listbox (Phase 16.4): theme-styled panel (shadow-md, 36px
 * options, selected accent-50), type-ahead / Home / End from the native MUI
 * pattern, instant close. RHF: use with Controller (documented — MUI Select
 * proxies a hidden input, so register() refs are not reliable).
 */
export const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(
  {
    label,
    hiddenLabel,
    id: idProp,
    name,
    options,
    value,
    defaultValue,
    onChange,
    onBlur,
    placeholder,
    required,
    disabled,
    size = 'md',
    helperText,
    error,
    warning,
    success,
  },
  ref,
) {
  const theme = useTheme();
  const autoId = useId();
  const id = idProp ?? autoId;
  const messages = { helperText, error, warning, success };

  return (
    <FieldWrapper
      id={id}
      label={label}
      hiddenLabel={hiddenLabel}
      required={required}
      disabled={disabled}
      {...messages}
    >
      <MuiSelect
        id={id}
        name={name}
        inputRef={ref}
        value={value ?? (defaultValue === undefined ? '' : undefined)}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        error={Boolean(error)}
        displayEmpty
        fullWidth
        IconComponent={(props: { className?: string }) => (
          <Box component="span" {...props} sx={{ display: 'inline-flex', mr: 2 }}>
            <Icon name="chevronDown" size={16} />
          </Box>
        )}
        renderValue={(selected) => {
          const option = options.find((o) => o.value === selected);
          if (!option) {
            return (
              <Box component="span" sx={{ color: theme.palette.text.disabled }}>
                {placeholder ?? 'Select…'}
              </Box>
            );
          }
          return (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              {option.icon}
              {option.label}
            </Box>
          );
        }}
        inputProps={{
          'aria-label': hiddenLabel ? label : undefined,
          ...fieldAria(id, messages, required),
        }}
        data-size={size}
        sx={{ height: HEIGHT[size] }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              {option.icon}
              <Box sx={{ minWidth: 0 }}>
                <Box component="span" sx={{ display: 'block' }}>
                  {option.label}
                </Box>
                {option.description && (
                  <Box
                    component="span"
                    sx={{
                      ...typeScale.textXs,
                      color: theme.palette.text.secondary,
                      display: 'block',
                    }}
                  >
                    {option.description}
                  </Box>
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </MuiSelect>
    </FieldWrapper>
  );
});
