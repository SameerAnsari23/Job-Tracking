import { forwardRef } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import MuiButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Spinner } from './Spinner';
import { warnDev } from '../internal/dev';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Locks measured width, swaps content for a spinner, blocks re-click. */
  loading?: boolean;
  disabled?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  /** Square icon-only mode — requires aria-label. */
  iconOnly?: boolean;
  type?: 'button' | 'submit';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
  /** Popup-trigger wiring (Dropdown/Popover clone these on). */
  'aria-haspopup'?: 'menu' | 'dialog' | 'listbox' | 'true';
  'aria-expanded'?: boolean;
  children?: ReactNode;
}

// Product variants → theme-styled MUI variants (styling lives in theme.ts).
const VARIANT_MAP = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'primary' },
  ghost: { variant: 'text', color: 'primary' },
  destructive: { variant: 'contained', color: 'error' },
} as const;

const SIZE_MAP = { sm: 'small', md: 'medium', lg: 'large' } as const;
const ICON_ONLY_SIZE = { sm: 28, md: 34, lg: 40 } as const;
const SPINNER_SIZE = { sm: 14, md: 16, lg: 16 } as const;

/**
 * Phase 16.2 button: 4 variants × 3 sizes, radius-md, no ripple, no caps,
 * translateY hover (all from the theme layer). Loading preserves width by
 * hiding the label in place under an absolutely centered spinner.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    iconStart,
    iconEnd,
    fullWidth = false,
    iconOnly = false,
    type = 'button',
    onClick,
    'aria-label': ariaLabel,
    'aria-haspopup': ariaHasPopup,
    'aria-expanded': ariaExpanded,
    children,
  },
  ref,
) {
  warnDev(
    iconOnly && !ariaLabel,
    '[Button] iconOnly buttons require an aria-label (Phase 16.4 G2).',
  );

  const mapped = VARIANT_MAP[variant];

  return (
    <MuiButton
      ref={ref}
      variant={mapped.variant}
      color={mapped.color}
      size={SIZE_MAP[size]}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      aria-label={ariaLabel}
      aria-haspopup={ariaHasPopup}
      aria-expanded={ariaExpanded}
      aria-busy={loading || undefined}
      startIcon={!iconOnly && !loading ? iconStart : undefined}
      endIcon={!iconOnly && !loading ? iconEnd : undefined}
      sx={{
        position: 'relative',
        ...(iconOnly
          ? {
              minWidth: ICON_ONLY_SIZE[size],
              width: ICON_ONLY_SIZE[size],
              padding: 0,
            }
          : {}),
      }}
    >
      {/* Hidden-in-place content preserves the button's measured width. */}
      <Box
        component="span"
        sx={{
          visibility: loading ? 'hidden' : 'visible',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
      {loading && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner size={SPINNER_SIZE[size]} delayMs={0} label="Loading" />
        </Box>
      )}
    </MuiButton>
  );
});
