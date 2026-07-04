import { forwardRef } from 'react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';

export interface DatePickerProps extends Omit<
  TextFieldProps,
  'type' | 'inputMode' | 'iconStart' | 'iconEnd' | 'inputProps'
> {
  /** Year-month granularity (experience dates). */
  monthYearOnly?: boolean;
  /** Refuse dates after today (start dates, DOB-style fields). */
  disableFuture?: boolean;
  /** ISO bounds (yyyy-mm-dd / yyyy-mm). Numbers accepted for RHF register() spread compatibility. */
  min?: string | number;
  max?: string | number;
}

function todayIso(monthOnly: boolean): string {
  const iso = new Date().toISOString();
  return monthOnly ? iso.slice(0, 7) : iso.slice(0, 10);
}

/**
 * Date input built on the native date/month control — full keyboard
 * operation, screen-reader support, and mobile pickers come from the
 * platform for free; field chrome from our F-contract wrapper.
 *
 * DELIBERATE SIMPLIFICATION of the Phase 16.4 custom-popover spec: the
 * product's only date fields are experience start/end months. A custom
 * a11y calendar grid is deferred until a use case demands day-precision
 * visual picking; values are ISO strings either way, so swapping the
 * control later is non-breaking.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { monthYearOnly = false, disableFuture = false, min, max, ...fieldProps },
  ref,
) {
  const computedMax = max?.toString() ?? (disableFuture ? todayIso(monthYearOnly) : undefined);

  return (
    <TextField
      {...fieldProps}
      ref={ref}
      type={monthYearOnly ? 'month' : 'date'}
      inputProps={{ min, max: computedMax }}
    />
  );
});
