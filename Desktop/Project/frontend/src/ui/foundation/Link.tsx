import { forwardRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import MuiLink from '@mui/material/Link';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Icon } from './Icon';

export interface LinkProps {
  href: string;
  /** inline: accent, hover underline · subtle: inherits color, hover underline. */
  variant?: 'inline' | 'subtle';
  /** New tab + noopener + external-link icon + SR "(opens in new tab)". */
  external?: boolean;
  /**
   * Router adapter (Phase 16.4: ui/ is router-agnostic). Pages pass their
   * router's Link component; plain <a> is the default.
   */
  routerComponent?: ElementType;
  'aria-label'?: string;
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    variant = 'inline',
    external = false,
    routerComponent,
    'aria-label': ariaLabel,
    children,
  },
  ref,
) {
  const theme = useTheme();

  // External links always render a real <a>; the router adapter applies to
  // internal navigation only.
  const component: ElementType = external ? 'a' : (routerComponent ?? 'a');
  const routed = !external && routerComponent;

  return (
    <MuiLink
      ref={ref}
      component={component}
      // React Router's Link takes `to`; a plain anchor takes `href`.
      {...(routed ? { to: href } : { href })}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        ...(variant === 'subtle' && {
          color: 'inherit',
          fontWeight: 'inherit',
        }),
      }}
    >
      {children}
      {external && (
        <>
          <Icon name="externalLink" size={14} />
          <Box
            component="span"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
              whiteSpace: 'nowrap',
            }}
            style={{ color: theme.palette.text.primary }}
          >
            (opens in new tab)
          </Box>
        </>
      )}
    </MuiLink>
  );
});
