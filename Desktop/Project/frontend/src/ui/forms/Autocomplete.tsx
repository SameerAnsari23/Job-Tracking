import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import MuiAutocomplete from '@mui/material/Autocomplete';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import { typeScale } from '@/theme';
import { Spinner } from '../foundation/Spinner';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';
import type { FieldSize } from './TextField';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

export interface AutocompleteProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  options: AutocompleteOption[];
  value: AutocompleteOption | null;
  onChange: (value: AutocompleteOption | null) => void;
  /** Text the user is typing — for async option loading by the caller. */
  onInputChange?: (text: string) => void;
  /** Async options in flight — renders a loading row (caller fetches). */
  loading?: boolean;
  noOptionsText?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: FieldSize;
}

const HEIGHT: Record<FieldSize, number> = { sm: 36, md: 40, lg: 44 };

/** Bolds the matched substring in an option label (Phase 16.4). */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <Box component="span" sx={{ fontWeight: 600 }}>
        {text.slice(index, index + query.length)}
      </Box>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * Single-select combobox: Select + text filtering + caller-driven async
 * loading. ARIA combobox/listbox pattern and keyboard handling come from
 * the MUI machinery; visuals from the theme layer.
 */
export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(function Autocomplete(
  {
    label,
    hiddenLabel,
    id: idProp,
    options,
    value,
    onChange,
    onInputChange,
    loading = false,
    noOptionsText = 'No matches',
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
      <MuiAutocomplete<AutocompleteOption>
        id={id}
        options={options}
        value={value}
        onChange={(_, v) => onChange(v)}
        onInputChange={(_, text) => onInputChange?.(text)}
        loading={loading}
        loadingText={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Spinner size={14} delayMs={0} label="Loading options" />
            <Box sx={{ ...typeScale.textSm }}>Loading…</Box>
          </Box>
        }
        noOptionsText={noOptionsText}
        disabled={disabled}
        isOptionEqualToValue={(a, b) => a.value === b.value}
        getOptionLabel={(o) => o.label}
        renderOption={(props, option, { inputValue }) => (
          <li {...props} key={option.value}>
            <Box sx={{ minWidth: 0 }}>
              <Box component="span" sx={{ display: 'block', ...typeScale.textSm }}>
                <HighlightMatch text={option.label} query={inputValue} />
              </Box>
              {option.description && (
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    ...typeScale.textXs,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {option.description}
                </Box>
              )}
            </Box>
          </li>
        )}
        renderInput={(params) => {
          const { InputProps, inputProps, ...rest } = params;
          return (
            <OutlinedInput
              {...rest}
              {...InputProps}
              inputRef={ref}
              placeholder={placeholder}
              required={required}
              error={Boolean(error)}
              fullWidth
              inputProps={{
                ...inputProps,
                'aria-label': hiddenLabel ? label : undefined,
                ...fieldAria(id, messages, required),
              }}
              data-size={size}
              sx={{ height: HEIGHT[size] }}
            />
          );
        }}
      />
    </FieldWrapper>
  );
});
