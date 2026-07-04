import { forwardRef, useId } from 'react';
import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, ReactNode } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { FieldWrapper } from './internal/FieldWrapper';
import { fieldAria } from './internal/fieldAria';
import type { FieldMessages } from './internal/fieldAria';

export type FieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps extends FieldMessages {
  label: string;
  hiddenLabel?: boolean;
  id?: string;
  /** Native name — React Hook Form register() spreads this. */
  name?: string;
  type?: 'text' | 'email' | 'url' | 'tel' | 'number' | 'password' | 'date' | 'month';
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  maxLength?: number;
  /** Show the counter (appears at 80% of maxLength — Phase 16.3). */
  showCount?: boolean;
  /** Current length for the counter in controlled usage. */
  valueLength?: number;
  inputMode?: 'text' | 'email' | 'numeric' | 'decimal' | 'search' | 'url' | 'tel';
  autoComplete?: string;
  autoFocus?: boolean;
  /** Extra input attributes (min/max for date types etc.). */
  inputProps?: Record<string, unknown>;
}

/** Heights per Phase 16.2: sm 36 · md 40 (default) · lg 44 (auth flows). */
const HEIGHT: Record<FieldSize, number> = { sm: 36, md: 40, lg: 44 };

/**
 * Base text input — F-contract chrome via FieldWrapper, theme-styled
 * OutlinedInput control. Ref forwards to the native input so RHF
 * register() works directly; controlled and uncontrolled both supported.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hiddenLabel,
    id: idProp,
    name,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onBlur,
    onKeyDown,
    placeholder,
    required,
    disabled,
    size = 'md',
    iconStart,
    iconEnd,
    maxLength,
    showCount,
    valueLength,
    inputMode,
    autoComplete,
    autoFocus,
    inputProps,
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
        type={type}
        inputRef={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        onBlur={onBlur as FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        onKeyDown={onKeyDown as KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={Boolean(error)}
        fullWidth
        startAdornment={
          iconStart ? <InputAdornment position="start">{iconStart}</InputAdornment> : undefined
        }
        endAdornment={
          iconEnd ? <InputAdornment position="end">{iconEnd}</InputAdornment> : undefined
        }
        inputProps={{
          maxLength,
          inputMode,
          ...fieldAria(id, messages, required),
          ...inputProps,
        }}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        data-size={size}
        sx={{ height: HEIGHT[size] }}
      />
    </FieldWrapper>
  );
});
