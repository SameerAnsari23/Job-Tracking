import { forwardRef } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import Box from '@mui/material/Box';
import { Surface } from '../foundation/Surface';
import type { SurfaceLevel } from '../foundation/Surface';
import { Divider } from '../foundation/Divider';

export interface CardProps {
  level?: SurfaceLevel;
  /** Whole-card click target: hover lift + a full-surface overlay link. */
  interactive?: boolean;
  /** Href for the interactive overlay (rendered as a real <a>). */
  href?: string;
  onClick?: MouseEventHandler;
  /** Accessible name for the overlay link/button. */
  'aria-label'?: string;
  /** Padding in grid units — 6 (24px) standard, 5 (20px) compact lists. */
  padding?: number;
  children: ReactNode;
}

interface CardSlotProps {
  children: ReactNode;
}

/**
 * Header slot — separated from the body by a hairline divider (16.2).
 * Inner interactive elements stay clickable above the card overlay.
 */
function CardHeader({ children }: CardSlotProps) {
  return (
    <Box data-slot="header" sx={{ position: 'relative', zIndex: 1 }}>
      {children}
      <Box sx={{ mt: 4 }}>
        <Divider />
      </Box>
    </Box>
  );
}

function CardBody({ children }: CardSlotProps) {
  return (
    <Box data-slot="body" sx={{ position: 'relative', py: 4, '&:first-of-type': { pt: 0 } }}>
      {children}
    </Box>
  );
}

function CardFooter({ children }: CardSlotProps) {
  return (
    <Box data-slot="footer" sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Divider />
      </Box>
      {children}
    </Box>
  );
}

/**
 * General card composition over Surface (Phase 16.4 compound pattern:
 * Card.Header / Card.Body / Card.Footer). Interactive mode uses the
 * overlay-link technique: one <a>/<button> stretched over the surface, so
 * the whole card is a single tab stop while nested buttons (save, menu)
 * keep their own stops above it via z-index.
 */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    level = 'flat',
    interactive = false,
    href,
    onClick,
    'aria-label': ariaLabel,
    padding = 6,
    children,
  },
  ref,
) {
  return (
    <Box ref={ref} data-variant={level} sx={{ position: 'relative' }}>
      <Surface level={level} interactive={interactive} padding={padding}>
        {interactive && (href || onClick) && (
          <Box
            component={href ? 'a' : 'button'}
            href={href}
            onClick={onClick}
            aria-label={ariaLabel}
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderRadius: 'inherit',
              padding: 0,
            }}
          />
        )}
        {children}
      </Surface>
    </Box>
  );
});

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
