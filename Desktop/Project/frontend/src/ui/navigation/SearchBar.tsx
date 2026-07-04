import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Spinner } from '../foundation/Spinner';
import { SearchField } from '../forms/SearchField';
import type { FieldSize } from '../forms/TextField';

export interface SearchBarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
  size?: FieldSize;
  hotkeyHint?: string;
  /** Shows a spinner in place of the clear/hint adornment while true. */
  loading?: boolean;
  /** Rendered after the field — filter chips, a "Filters" button, etc. */
  filters?: ReactNode;
}

/**
 * Debounced search bar with a filters slot (Phase 17.5) — a composition
 * over forms/SearchField, not a reimplementation. SearchField already owns
 * the debounce timer, clear button, and hotkey-hint chip; duplicating that
 * logic here would violate the no-duplicated-logic rule for no benefit.
 * This component adds exactly two things SearchField doesn't have: a
 * loading indicator and a slot for adjacent filter controls.
 */
export function SearchBar({
  label,
  value,
  onChange,
  onDebouncedChange,
  onSearch,
  debounceMs,
  placeholder,
  disabled,
  size,
  hotkeyHint,
  loading = false,
  filters,
}: SearchBarProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <SearchField
          label={label}
          value={value}
          onChange={onChange}
          onDebouncedChange={onDebouncedChange}
          onSearch={onSearch}
          debounceMs={debounceMs}
          placeholder={placeholder}
          disabled={disabled || loading}
          size={size}
          hotkeyHint={loading ? undefined : hotkeyHint}
        />
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'inline-flex',
            }}
          >
            <Spinner size={14} delayMs={0} label="Searching" />
          </Box>
        )}
      </Box>
      {filters}
    </Box>
  );
}
