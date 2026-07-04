import { forwardRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import {
  accent,
  accentDark,
  neutralLight,
  neutralDark,
  radius,
  duration,
  easing,
  opacity,
  typeScale,
} from '@/theme';
import { Icon } from './Icon';

export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: string;
  /** Selected/filter-active state (Phase 16.2 chip table). */
  selected?: boolean;
  /** Makes the chip an interactive toggle (button semantics + aria-pressed). */
  onToggle?: () => void;
  /** Adds a removable × with its own focus stop; Delete/Backspace also removes. */
  onRemove?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  size?: ChipSize;
}

const HEIGHT = { sm: 24, md: 28 } as const;

/**
 * Interactive filter token (Phase 16.4). The wrapper is never interactive
 * itself — toggle and remove are SIBLING buttons inside it (interactive
 * controls must not nest, axe nested-interactive). Non-interactive chips
 * render as a plain span. Distinct from Badge: chips filter, badges state.
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  { label, selected = false, onToggle, onRemove, disabled = false, icon, size = 'sm' },
  ref,
) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;

  const interactive = Boolean(onToggle);

  const colors = selected
    ? { bg: a[50], border: a[200], text: a[600], hoverBg: a[100] }
    : { bg: n[100], border: n[200], text: n[700], hoverBg: n[150] };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (onRemove && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      onRemove();
    }
  };

  const removeButton = onRemove && (
    <ButtonBase
      aria-label={`Remove ${label}`}
      disabled={disabled}
      onClick={onRemove}
      sx={{
        borderRadius: `${radius.sm}px`,
        display: 'inline-flex',
        p: 0.5,
        color: 'inherit',
        '&:hover': { backgroundColor: colors.hoverBg },
      }}
    >
      <Icon name="close" size={14} />
    </ButtonBase>
  );

  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        height: HEIGHT[size],
        pl: 2.5,
        pr: onRemove ? 1 : 2.5,
        borderRadius: `${radius.sm}px`,
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        transition: `background-color ${duration.fast}ms ${easing.easeOut}, border-color ${duration.fast}ms ${easing.easeOut}`,
        ...(disabled ? { opacity: opacity.disabled, pointerEvents: 'none' as const } : {}),
        ...(interactive && !disabled
          ? {
              '&:hover': {
                backgroundColor: colors.hoverBg,
                borderColor: selected ? a[200] : n[300],
              },
            }
          : {}),
      }}
    >
      {interactive ? (
        <ButtonBase
          aria-pressed={selected}
          disabled={disabled}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            height: '100%',
            color: 'inherit',
            ...typeScale.labelSm,
          }}
        >
          {icon}
          <span>{label}</span>
        </ButtonBase>
      ) : (
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, ...typeScale.labelSm }}
        >
          {icon}
          <span>{label}</span>
        </Box>
      )}
      {removeButton}
    </Box>
  );
});
