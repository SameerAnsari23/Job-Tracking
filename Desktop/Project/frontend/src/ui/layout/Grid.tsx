import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

export interface GridColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridProps {
  /** Real column counts per breakpoint — no 12-column abstraction (16.4). */
  columns: number | GridColumns;
  /** Gap in 4px grid units. */
  gap?: number;
  children: ReactNode;
}

function template(count: number): string {
  return `repeat(${count}, minmax(0, 1fr))`;
}

/** Token-gap CSS grid with breakpoint-aware column maps. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns, gap = 6, children },
  ref,
) {
  const gridTemplateColumns =
    typeof columns === 'number'
      ? template(columns)
      : Object.fromEntries(Object.entries(columns).map(([bp, count]) => [bp, template(count)]));

  return (
    <Box ref={ref} sx={{ display: 'grid', gap, gridTemplateColumns }}>
      {children}
    </Box>
  );
});
