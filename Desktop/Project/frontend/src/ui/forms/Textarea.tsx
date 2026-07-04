import { forwardRef, useId } from 'react';
import type { ChangeEventHandler, FocusEventHandler } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';

export interface TextareaProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  /** Counter appears at 80% consumption (Phase 16.3). */
  showCount?: boolean;
  valueLength?: number;
  minRows?: number;
  maxRows?: number;
}

/**
 * Auto-growing textarea (3–10 rows, then scroll). Resize handle disabled —
 * auto-grow replaces it (Phase 16.4).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hiddenLabel,
    id: idProp,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    placeholder,
    required,
    disabled,
    maxLength,
    showCount,
    valueLength,
    minRows = 3,
    maxRows = 10,
    helperText,
    error,
    warning,
    success,
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const messages = { helperText, error, warning, success };

  const count = valueLength ?? value?.length;
  const counter =
    showCount && maxLength !== undefined && count !== undefined
      ? { count, max: maxLength }
      : undefined;

  return (
    <FieldWrapper
      id={id}
      label={label}
      hiddenLabel={hiddenLabel}
      required={required}
      disabled={disabled}
      counter={counter}
      {...messages}
    >
      <OutlinedInput
        id={id}
        name={name}
        inputRef={ref}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        onBlur={onBlur as FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={Boolean(error)}
        fullWidth
        inputProps={{
          maxLength,
          style: { resize: 'none' },
          ...fieldAria(id, messages, required),
        }}
        sx={{ height: 'auto', alignItems: 'flex-start' }}
      />
    </FieldWrapper>
  );
});
