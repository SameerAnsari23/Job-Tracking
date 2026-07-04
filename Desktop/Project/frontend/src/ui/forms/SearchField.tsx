import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, radius, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import { FieldWrapper } from './internal/FieldWrapper';
import type { FieldSize } from './TextField';

export interface SearchFieldProps {
  label: string;
  /** Search inputs usually carry their label for screen readers only. */
  hiddenLabel?: boolean;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Fires after the debounce settles (300ms default). */
  onDebouncedChange?: (value: string) => void;
  /** Enter forces an immediate search, skipping the debounce. */
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  size?: FieldSize;
  /** Keycap hint rendered at the end (e.g. "⌘K"). */
  hotkeyHint?: string;
}

const HEIGHT: Record<FieldSize, number> = { sm: 36, md: 40, lg: 48 };

/**
 * Debounced search input (Phase 16.4): magnifier start icon, clear × when
 * populated, Enter → immediate onSearch. Controlled-only — search state
 * always lives with the caller (URL/store sync).
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    label,
    hiddenLabel = true,
    id: idProp,
    value,
    onChange,
    onDebouncedChange,
    onSearch,
    debounceMs = 300,
    placeholder,
    disabled,
    size = 'md',
    hotkeyHint,
  },
  ref,
) {
  const theme = useTheme();
  const n = theme.palette.mode === 'dark' ? neutralDark : neutralLight;
  const autoId = useId();
  const id = idProp ?? autoId;

  const [pending, setPending] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pending === null || !onDebouncedChange) return;
    timer.current = setTimeout(() => onDebouncedChange(pending), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pending, debounceMs, onDebouncedChange]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value);
    setPending(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      if (timer.current) clearTimeout(timer.current);
      setPending(null);
      onSearch(value);
    }
  };

  const clear = () => {
    onChange('');
    setPending('');
  };

  return (
    <FieldWrapper id={id} label={label} hiddenLabel={hiddenLabel} disabled={disabled}>
      <OutlinedInput
        id={id}
        inputRef={ref}
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth
        inputProps={{ role: 'searchbox', 'aria-label': hiddenLabel ? label : undefined }}
        data-size={size}
        sx={{
          height: HEIGHT[size],
          // Hide the native WebKit clear control — we render our own.
          '& input::-webkit-search-cancel-button': { WebkitAppearance: 'none' },
        }}
        startAdornment={
          <InputAdornment position="start">
            <Icon name="search" size={16} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            {value ? (
              <IconButton aria-label="Clear search" onClick={clear} size="small" edge="end">
                <Icon name="close" size={14} />
              </IconButton>
            ) : hotkeyHint ? (
              <Box
                component="kbd"
                aria-hidden
                sx={{
                  ...typeScale.labelSm,
                  color: theme.palette.text.secondary,
                  border: `1px solid ${n[200]}`,
                  borderRadius: `${radius.sm}px`,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: n[100],
                }}
              >
                {hotkeyHint}
              </Box>
            ) : null}
          </InputAdornment>
        }
      />
    </FieldWrapper>
  );
});
