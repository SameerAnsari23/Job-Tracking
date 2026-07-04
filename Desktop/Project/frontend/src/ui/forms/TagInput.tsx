import { useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, accent, accentDark, radius, typeScale, opacity } from '@/theme';
import { Chip } from '../foundation/Chip';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';

export interface TagInputProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  /** Validate a candidate tag; return an error string to reject it. */
  validateTag?: (tag: string) => string | null;
  maxTags?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Free-text token input (skills, locations, titles — Phase 16.4).
 * Enter/comma commits · Backspace on empty pulls the last tag back into the
 * input for editing · per-tag remove buttons are separate focus stops.
 * Duplicates are silently ignored; validateTag rejections surface as the
 * field error until the input changes.
 */
export function TagInput({
  label,
  hiddenLabel,
  id: idProp,
  value,
  onChange,
  validateTag,
  maxTags,
  placeholder,
  required,
  disabled = false,
  helperText,
  error,
  warning,
  success,
}: TagInputProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const autoId = useId();
  const id = idProp ?? autoId;

  const [text, setText] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const atCap = maxTags !== undefined && value.length >= maxTags;
  const messages = { helperText, error: error ?? tagError ?? undefined, warning, success };

  const commit = () => {
    const tag = text.trim();
    if (!tag) return;
    if (atCap) {
      setTagError(`Maximum ${maxTags} entries.`);
      return;
    }
    const rejection = validateTag?.(tag) ?? null;
    if (rejection) {
      setTagError(rejection);
      return;
    }
    setTagError(null);
    setText('');
    if (!value.includes(tag)) onChange([...value, tag]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
      return;
    }
    if (event.key === 'Backspace' && text === '' && value.length > 0) {
      event.preventDefault();
      const last = value[value.length - 1]!;
      onChange(value.slice(0, -1));
      setText(last);
    }
  };

  return (
    <FieldWrapper
      id={id}
      label={label}
      hiddenLabel={hiddenLabel}
      required={required}
      disabled={disabled}
      {...messages}
    >
      {/* Field chrome around chips + inline input; clicking focuses the input. */}
      <Box
        onClick={() => inputRef.current?.focus()}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 40,
          px: 2,
          py: 1.5,
          borderRadius: `${radius.md}px`,
          border: `1px solid ${messages.error ? theme.palette.error.main : n[300]}`,
          backgroundColor: theme.palette.background.paper,
          cursor: 'text',
          ...(disabled ? { opacity: opacity.disabled, pointerEvents: 'none' as const } : {}),
          '&:focus-within': {
            borderColor: a[500],
            boxShadow: `0 0 0 2px ${a[200]}`,
          },
        }}
      >
        {value.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onRemove={disabled ? undefined : () => onChange(value.filter((t) => t !== tag))}
          />
        ))}
        <Box
          component="input"
          ref={inputRef}
          id={id}
          value={text}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(e) => {
            setText(e.target.value);
            if (tagError) setTagError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          {...fieldAria(id, messages, required)}
          sx={{
            flex: 1,
            minWidth: 96,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            ...typeScale.textBase,
            '&::placeholder': { color: n[400] },
          }}
        />
      </Box>
      <Box
        role="status"
        sx={{
          ...typeScale.textXs,
          color: theme.palette.text.secondary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.length}
        {maxTags !== undefined ? ` of ${maxTags}` : ''} added
      </Box>
    </FieldWrapper>
  );
}
