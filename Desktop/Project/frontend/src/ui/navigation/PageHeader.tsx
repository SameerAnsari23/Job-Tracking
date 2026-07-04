import type { ElementType, ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Typography } from '../foundation/Typography';
import { Icon } from '../foundation/Icon';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned action row (primary rightmost). */
  actions?: ReactNode;
  /** Rendered below the title row — typically a Tabs component. */
  tabs?: ReactNode;
  backHref?: string;
  routerComponent?: ElementType;
  children?: ReactNode;
}

/**
 * The single page-title landmark (Phase 16.4): establishes the page's h1/h2
 * so no page hand-rolls its own heading hierarchy. space-8 bottom margin is
 * the caller's concern (via the surrounding page Stack), not this
 * component's — PageHeader owns only its own internal spacing.
 */
export function PageHeader({
  title,
  description,
  actions,
  tabs,
  backHref,
  routerComponent,
  children,
}: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {backHref && (
        <Box
          component={routerComponent ?? 'a'}
          href={!routerComponent ? backHref : undefined}
          to={routerComponent ? backHref : undefined}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 13,
            color: 'text.secondary',
            textDecoration: 'none',
            width: 'fit-content',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <Icon name="arrowLeft" size={14} />
          Back
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 4,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <Typography variant="h2" as="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="textBase" color="secondary">
              {description}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 3, flexShrink: 0 }}>{actions}</Box>}
      </Box>

      {children}
      {tabs}
    </Box>
  );
}
