import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { typeScale } from '@/theme';
import { ValidationMessage } from '../ValidationMessage';
import type { ValidationTone } from '../ValidationMessage';
import { fieldMessageId } from './fieldAria';
import type { FieldMessages } from './fieldAria';

export interface FieldWrapperProps extends FieldMessages {
  /** Field id — the label's htmlFor and the message ids derive from it. */
  id: string;
  label: string;
  /** Keep the label for screen readers only (visually hidden). */
  hiddenLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  /** Character counter — rendered when max is known and count ≥ 80% of it. */
  counter?: { count: number; max: number };
  children: ReactNode;
}

/**
 * The F-contract chrome shared by every field (Phase 16.4 §2.2): external
 * label above the control, helper/validation text below, auto-wired ids.
 * This is the ONE place field-message logic lives — components never
 * reimplement it (no duplicated form logic rule).
 *
 * Message priority: error > warning > success > helper.
 */
export function FieldWrapper({
  id,
  label,
  hiddenLabel = false,
  required = false,
  disabled = false,
  helperText,
  error,
  warning,
  success,
  counter,
  children,
}: FieldWrapperProps) {
  const theme = useTheme();

  const message: { tone: ValidationTone; text: string } | null = error
    ? { tone: 'error', text: error }
    : warning
      ? { tone: 'warning', text: warning }
      : success
        ? { tone: 'success', text: success }
        : null;

  const showCounter = counter && counter.count >= counter.max * 0.8;

  return (
    <Box
      data-disabled={disabled || undefined}
      data-state={error ? 'error' : warning ? 'warning' : success ? 'success' : undefined}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}
    >
      <Box
        component="label"
        htmlFor={id}
        sx={{
          ...typeScale.textSm,
          fontWeight: 500,
          color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
          ...(hiddenLabel && {
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
          }),
        }}
      >
        {label}
        {required && (
          <Box component="span" aria-hidden sx={{ color: theme.palette.error.main, ml: 0.5 }}>
            *
          </Box>
        )}
      </Box>

      {children}

      {(message || helperText || showCounter) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
          <Box sx={{ minWidth: 0 }}>
            {message ? (
              <ValidationMessage tone={message.tone} id={fieldMessageId(id)}>
                {message.text}
              </ValidationMessage>
            ) : helperText ? (
              <Box
                id={fieldMessageId(id)}
                sx={{ ...typeScale.textXs, color: theme.palette.text.secondary }}
              >
                {helperText}
              </Box>
            ) : null}
          </Box>
          {showCounter && (
            <Box
              aria-hidden
              sx={{
                ...typeScale.textXs,
                color:
                  counter.count > counter.max
                    ? theme.palette.error.main
                    : theme.palette.text.secondary,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              {counter.count}/{counter.max}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
