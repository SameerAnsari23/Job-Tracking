import { useState } from 'react';
import type { ElementType, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Menu } from '../layout/Menu';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: IconName;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  routerComponent?: ElementType;
  /** Collapse to an ellipsis menu once there are more than this many items. */
  maxVisible?: number;
  /**
   * Called instead of a full page navigation when a HIDDEN (ellipsis-menu)
   * item is selected. Menu (reused from ui/layout) renders items as
   * buttons, not links, so SPA routing for the collapsed items needs an
   * explicit hook here — the page supplies its router's navigate function.
   * Visible crumbs still render as real anchors/router links directly.
   */
  onNavigate?: (href: string) => void;
}

/**
 * Wayfinding trail (Phase 16.4): truncates the middle beyond `maxVisible`
 * into an ellipsis menu. Reuses ui/layout's Menu for the overflow panel
 * rather than hand-rolling a second theme-styled popup — Menu already owns
 * the token-styled panel chrome (shadow-md, radius-lg, border) and the
 * role="menu" keyboard pattern. Last item is the current page: plain text,
 * aria-current="page", not a link.
 */
export function Breadcrumb({
  items,
  routerComponent,
  maxVisible = 3,
  onNavigate,
}: BreadcrumbProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const collapsed = items.length > maxVisible;
  const first = items[0];
  const hidden = collapsed ? items.slice(1, -2) : [];
  const visibleTail = collapsed ? items.slice(-2) : items.slice(1);

  const Separator = () => (
    <Box
      component="span"
      aria-hidden
      sx={{ display: 'inline-flex', color: theme.palette.text.disabled, mx: 1 }}
    >
      <Icon name="chevronRight" size={14} />
    </Box>
  );

  const renderCrumb = (item: BreadcrumbItem, isLast: boolean) => {
    // Single element per crumb (not text nested inside a wrapper span) so
    // aria-current sits on the exact node a screen reader — or a
    // `getByText` query — resolves the label to.
    if (isLast || !item.href) {
      return (
        <Box
          component="span"
          aria-current={isLast ? 'page' : undefined}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 13,
            color: theme.palette.text.primary,
            fontWeight: isLast ? 500 : 400,
          }}
        >
          {item.icon && <Icon name={item.icon} size={14} />}
          {item.label}
        </Box>
      );
    }

    return (
      <Box
        component={routerComponent ?? 'a'}
        href={!routerComponent ? item.href : undefined}
        to={routerComponent ? item.href : undefined}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          fontSize: 13,
          color: theme.palette.text.secondary,
          textDecoration: 'none',
          '&:hover': { color: theme.palette.text.primary, textDecoration: 'underline' },
        }}
      >
        {item.icon && <Icon name={item.icon} size={14} />}
        {item.label}
      </Box>
    );
  };

  return (
    <Box component="nav" aria-label="Breadcrumb">
      <Box
        component="ol"
        sx={{ display: 'flex', alignItems: 'center', listStyle: 'none', m: 0, p: 0 }}
      >
        {first && (
          <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
            {renderCrumb(first, items.length === 1)}
          </Box>
        )}

        {collapsed && (
          <Box component="li" sx={{ display: 'flex', alignItems: 'center' }}>
            <Separator />
            <ButtonBase
              aria-label="Show hidden breadcrumb items"
              aria-haspopup="menu"
              aria-expanded={Boolean(anchorEl)}
              onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
              sx={{
                fontSize: 13,
                color: theme.palette.text.secondary,
                px: 1,
                borderRadius: 1,
                '&:hover': { color: theme.palette.text.primary },
              }}
            >
              …
            </ButtonBase>
            <Menu
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              aria-label="Hidden breadcrumb items"
              items={hidden.map((item) => ({
                label: item.label,
                icon: item.icon,
                onSelect: () => {
                  if (!item.href) return;
                  if (onNavigate) onNavigate(item.href);
                  else window.location.assign(item.href);
                },
              }))}
            />
          </Box>
        )}

        {visibleTail.map((item, index) => {
          const isLast = index === visibleTail.length - 1;
          return (
            <Box key={item.label} component="li" sx={{ display: 'flex', alignItems: 'center' }}>
              <Separator />
              {renderCrumb(item, isLast)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
