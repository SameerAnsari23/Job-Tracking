import { forwardRef } from 'react';
import type { ElementType, ReactNode, CSSProperties, HTMLAttributes } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { typeScale, mobileHeadingScale, mobileMediaQuery, fontFamilyMono } from '@/theme';

export type TypographyVariant = keyof typeof typeScale;

export type TypographyColor =
  'primary' | 'secondary' | 'disabled' | 'accent' | 'success' | 'warning' | 'error' | 'inherit';

/**
 * Interaction/ARIA attributes a composing component (Tooltip, Popover,
 * Menu…) clones onto its child via cloneElement — e.g. MUI Tooltip injects
 * onMouseOver/onFocus/onTouchStart/aria-describedby, not the more
 * "obvious" onMouseEnter. Deliberately excludes `className`/`style`/
 * `color` — those stay behind the ui/ styling-boundary (tokens/variants
 * only, no ad-hoc overrides at call sites); `color` also collides with
 * Typography's own semantic color prop.
 */
type ForwardedNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'className' | 'style' | 'color' | 'children'
>;

export interface TypographyProps extends ForwardedNativeProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  /** Semantic element override — visual size and document outline decouple. */
  as?: ElementType;
  /** Truncate to N lines with ellipsis (1 = single-line). */
  truncate?: number;
  /** Tabular numerals — every numeric column, stat, and timestamp. */
  tabularNums?: boolean;
  /** `text-wrap: balance` — automatic on heading variants. */
  balance?: boolean;
  /** Monospace face (provider ids, job ids, technical metadata). */
  mono?: boolean;
  id?: string;
  children: ReactNode;
}

const HEADING_VARIANTS = new Set<TypographyVariant>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const DEFAULT_ELEMENT: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  textXs: 'span',
  textSm: 'p',
  textBase: 'p',
  textMd: 'p',
  labelXs: 'span',
  labelSm: 'span',
};

/**
 * The single text primitive (Phase 16.4 §2.1) — every visible string renders
 * through it. Applies the 11-step type scale; headings balance and downscale
 * on mobile automatically.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  {
    variant = 'textBase',
    color = 'primary',
    as,
    truncate,
    tabularNums = false,
    balance,
    mono = false,
    id,
    children,
    ...nativeProps
  },
  ref,
) {
  const theme = useTheme();
  const isHeading = HEADING_VARIANTS.has(variant);

  const colorValue: Record<TypographyColor, string> = {
    primary: theme.palette.text.primary,
    secondary: theme.palette.text.secondary,
    disabled: theme.palette.text.disabled,
    accent: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    inherit: 'inherit',
  };

  const truncateStyles: CSSProperties =
    truncate === 1
      ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : truncate && truncate > 1
        ? {
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: truncate,
            WebkitBoxOrient: 'vertical',
          }
        : {};

  const responsive =
    variant === 'h1' || variant === 'h2' || variant === 'h3'
      ? { [mobileMediaQuery]: mobileHeadingScale[variant] }
      : {};

  return (
    <Box
      ref={ref}
      component={as ?? DEFAULT_ELEMENT[variant]}
      id={id}
      {...nativeProps}
      sx={{
        m: 0,
        ...typeScale[variant],
        ...(mono ? { fontFamily: fontFamilyMono } : {}),
        color: colorValue[color],
        ...(tabularNums ? { fontVariantNumeric: 'tabular-nums' } : {}),
        ...((balance ?? isHeading) ? { textWrap: 'balance' } : {}),
        ...truncateStyles,
        ...responsive,
      }}
    >
      {children}
    </Box>
  );
});
