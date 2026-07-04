import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { layout } from '@/theme';

export type ContainerWidth = 'narrow' | 'default' | 'wide';

export interface ContainerProps {
  /** narrow 720 (settings/forms) · default 1280 · wide 1440 (workbench). */
  width?: ContainerWidth;
  /** Vertical page padding — on by default; off for flush compositions. */
  paddedY?: boolean;
  as?: 'div' | 'main' | 'section';
  children: ReactNode;
}

const MAX_WIDTH: Record<ContainerWidth, number> = {
  narrow: layout.maxWidth.narrow,
  default: layout.maxWidth.default,
  wide: layout.maxWidth.wide,
};

/**
 * Page content wrapper (Phase 16.4): centered max-width with the
 * responsive page padding from the spacing tokens (40/24/16).
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { width = 'default', paddedY = true, as = 'div', children },
  ref,
) {
  return (
    <Box
      ref={ref}
      component={as}
      data-variant={width}
      sx={{
        width: '100%',
        maxWidth: MAX_WIDTH[width],
        mx: 'auto',
        px: {
          xs: `${layout.pagePadding.mobile}px`,
          sm: `${layout.pagePadding.tablet}px`,
          lg: `${layout.pagePadding.desktop}px`,
        },
        ...(paddedY && { py: 8 }),
      }}
    >
      {children}
    </Box>
  );
});
