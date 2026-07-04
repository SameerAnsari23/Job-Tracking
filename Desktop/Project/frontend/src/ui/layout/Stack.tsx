import { Children, Fragment, forwardRef } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Divider } from '../foundation/Divider';

export interface StackProps {
  direction?: 'column' | 'row';
  /** Gap in 4px grid units — the ONLY sibling spacing mechanism (16.4 rule). */
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  /** Interleaves a Divider between children. */
  divider?: boolean;
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav';
  children: ReactNode;
}

const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} as const;

/**
 * The workhorse layout primitive: flex + gap. Margins between siblings are
 * banned product-wide — Stack/Grid gaps own all separation (Phase 16.4).
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 0,
    align,
    justify,
    wrap = false,
    divider = false,
    as = 'div',
    children,
  },
  ref,
) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <Box
      ref={ref}
      component={as}
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap,
        ...(align && { alignItems: ALIGN[align] }),
        ...(justify && { justifyContent: JUSTIFY[justify] }),
        ...(wrap && { flexWrap: 'wrap' }),
        ...(as === 'ul' || as === 'ol' ? { listStyle: 'none', m: 0, p: 0 } : {}),
      }}
    >
      {divider
        ? items.map((child, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <Divider orientation={direction === 'row' ? 'vertical' : 'horizontal'} />
              )}
              {child}
            </Fragment>
          ))
        : children}
    </Box>
  );
});
