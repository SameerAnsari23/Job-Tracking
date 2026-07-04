export interface FieldMessages {
  helperText?: string;
  error?: string;
  warning?: string;
  success?: string;
}

/** Message element id — fields point aria-describedby here. */
export function fieldMessageId(id: string): string {
  return `${id}-message`;
}

/** Composes the aria props every field control must spread. */
export function fieldAria(id: string, messages: FieldMessages, required?: boolean) {
  const hasMessage = Boolean(
    messages.error || messages.warning || messages.success || messages.helperText,
  );
  return {
    'aria-invalid': messages.error ? true : undefined,
    'aria-required': required || undefined,
    'aria-describedby': hasMessage ? fieldMessageId(id) : undefined,
  } as const;
}
