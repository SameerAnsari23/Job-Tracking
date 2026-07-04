import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import MuiAutocomplete from '@mui/material/Autocomplete';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import { typeScale } from '@/theme';
import { Chip } from '../foundation/Chip';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';
import type { AutocompleteOption } from './Autocomplete';

export interface MultiSelectProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  options: AutocompleteOption[];
  value: AutocompleteOption[];
  onChange: (value: AutocompleteOption[]) => void;
  /** Selection cap — options disable beyond it; counter shows n/max. */
  maxSelected?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Multi-select combobox (Phase 16.4): selections render as removable Chips
 * inside the field; "{n} selected" announced; maxSelected disables further
 * options rather than erroring.
 */
export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(
  {
    label,
    hiddenLabel,
    id: idProp,
    options,
    value,
    onChange,
    maxSelected,
    placeholder,
    required,
    disabled,
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
  const atCap = maxSelected !== undefined && value.length >= maxSelected;

  return (
    <FieldWrapper
      id={id}
      label={label}
      hiddenLabel={hiddenLabel}
      required={required}
      disabled={disabled}
      {...messages}
    >
      <MuiAutocomplete<AutocompleteOption, true>
        id={id}
        multiple
        options={options}
        value={value}
        onChange={(_, v) => onChange(v)}
        disabled={disabled}
        disableCloseOnSelect
        isOptionEqualToValue={(a, b) => a.value === b.value}
        getOptionLabel={(o) => o.label}
        getOptionDisabled={(o) => atCap && !value.some((v) => v.value === o.value)}
        renderTags={(selected, getTagProps) =>
          selected.map((option, index) => {
            const { key, onDelete } = getTagProps({ index }) as unknown as {
              key: string;
              onDelete: () => void;
            };
            return (
              <Box key={key} component="span" sx={{ mr: 1, my: 0.5 }}>
                <Chip label={option.label} onRemove={disabled ? undefined : onDelete} />
              </Box>
            );
          })
        }
        renderInput={(params) => {
          const { InputProps, inputProps, ...rest } = params;
          return (
            <OutlinedInput
              {...rest}
              {...InputProps}
              inputRef={ref}
              placeholder={value.length === 0 ? placeholder : undefined}
              error={Boolean(error)}
              fullWidth
              inputProps={{
                ...inputProps,
                'aria-label': hiddenLabel ? label : undefined,
                ...fieldAria(id, messages, required),
              }}
              sx={{ height: 'auto', minHeight: 40, flexWrap: 'wrap', py: 1 }}
            />
          );
        }}
      />
      <Box
        role="status"
        sx={{
          ...typeScale.textXs,
          color: theme.palette.text.secondary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.length} selected{maxSelected !== undefined ? ` of ${maxSelected}` : ''}
      </Box>
    </FieldWrapper>
  );
});
