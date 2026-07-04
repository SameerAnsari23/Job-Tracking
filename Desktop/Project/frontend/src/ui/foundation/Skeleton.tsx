import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

export type SkeletonShape = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
  /** Multi-line text mode — last line renders at 60% width. */
  lines?: number;
}

const SHAPE_MAP = { text: 'text', rect: 'rectangular', circle: 'circular' } as const;

/**
 * Geometry placeholder (Phase 16.4 G4): every async component pairs with a
 * skeleton matching its EXACT final geometry — zero layout shift on load.
 * aria-hidden: the loading announcement belongs to the containing region
 * (one aria-busy region, not per-bone chatter).
 */
export function Skeleton({ shape = 'text', width, height, lines }: SkeletonProps) {
  if (shape === 'text' && lines && lines > 1) {
    return (
      <Box aria-hidden sx={{ display: 'flex', flexDirection: 'column', gap: 1, width }}>
        {Array.from({ length: lines }, (_, i) => (
          <MuiSkeleton
            key={i}
            variant="text"
            animation="wave"
            width={i === lines - 1 ? '60%' : '100%'}
            height={height}
          />
        ))}
      </Box>
    );
  }

  return (
    <MuiSkeleton
      aria-hidden
      variant={SHAPE_MAP[shape]}
      animation="wave"
      width={width}
      height={height}
    />
  );
}
