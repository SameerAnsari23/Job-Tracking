import { useEffect, useId, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import MuiDialog from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, layout, radius, typeScale } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Spinner } from '../foundation/Spinner';
import { HighlightMatch } from './internal/HighlightMatch';

export interface CommandPaletteItem {
  icon?: IconName;
  label: string;
  /** Keycap hint, e.g. "⌘K" or "↵". */
  hint?: string;
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  /** Result groups for the current query — computed by the caller. */
  groups: CommandPaletteGroup[];
  /** Shown ABOVE `groups` only while the query is empty. */
  recentItems?: CommandPaletteItem[];
  loading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
}

interface FlatItem extends CommandPaletteItem {
  optionId: string;
}

/**
 * UI-only command palette (Phase 16.4) — no fuzzy matching or ranking here;
 * `groups`/`recentItems` arrive pre-computed from the feature layer. This
 * component owns: layout, the combobox/listbox ARIA wiring, keyboard
 * navigation (arrow/Home/End/Enter/Escape) across the flattened result set,
 * and presentational substring highlighting via the current `query`.
 *
 * Built on the bare MUI Dialog (not ui/layout's Dialog wrapper, which
 * enforces a title+description header this headless, input-first chrome
 * doesn't have) — top-aligned at 20vh per the design spec.
 */
export function CommandPalette({
  open,
  onClose,
  query,
  onQueryChange,
  groups,
  recentItems = [],
  loading = false,
  emptyMessage = 'No matches',
  placeholder = 'Search jobs, companies…',
}: CommandPaletteProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const listboxId = useId();

  const displayGroups: CommandPaletteGroup[] = query
    ? groups
    : [...(recentItems.length > 0 ? [{ heading: 'Recent', items: recentItems }] : []), ...groups];

  const flat: FlatItem[] = useMemo(
    () =>
      displayGroups.flatMap((group, gi) =>
        group.items.map((item, ii) => ({ ...item, optionId: `${listboxId}-opt-${gi}-${ii}` })),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayGroups is a derived value recomputed each render intentionally
    [groups, recentItems, query, listboxId],
  );

  const [highlighted, setHighlighted] = useState(0);

  useEffect(() => {
    setHighlighted(0);
  }, [query, groups]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (flat.length === 0) {
      if (event.key === 'Escape') onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((i) => (i + 1) % flat.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => (i - 1 + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      flat[highlighted]?.onSelect();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  const activeOptionId = flat[highlighted]?.optionId;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-label="Command palette"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{
        sx: {
          mt: '20vh',
          width: layout.commandPaletteWidth,
          maxWidth: 'calc(100% - 32px)',
          borderRadius: `${radius.xl}px`,
          backgroundImage: 'none',
        },
      }}
    >
      <InputBase
        autoFocus
        fullWidth
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        startAdornment={
          <Box sx={{ display: 'inline-flex', mr: 3, color: theme.palette.text.secondary }}>
            <Icon name="search" size={18} />
          </Box>
        }
        sx={{ height: 52, px: 5, fontSize: 16, borderBottom: `1px solid ${n[200]}` }}
      />

      <Box
        id={listboxId}
        role="listbox"
        aria-label="Command palette results"
        sx={{ maxHeight: 360, overflowY: 'auto', p: 2 }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
            <Spinner size={16} delayMs={0} label="Loading results" />
            <Box sx={typeScale.textSm}>Loading…</Box>
          </Box>
        ) : flat.length === 0 ? (
          <Box sx={{ ...typeScale.textSm, color: theme.palette.text.secondary, p: 4 }}>
            {query ? `${emptyMessage} for "${query}"` : emptyMessage}
          </Box>
        ) : (
          displayGroups.map((group, gi) => (
            <Box key={group.heading} sx={{ mb: 2 }}>
              <Box
                sx={{
                  ...typeScale.labelXs,
                  color: theme.palette.text.secondary,
                  px: 3,
                  py: 1.5,
                }}
              >
                {group.heading}
              </Box>
              {group.items.map((item, ii) => {
                const optionId = `${listboxId}-opt-${gi}-${ii}`;
                const isActive = optionId === activeOptionId;
                return (
                  <Box
                    key={optionId}
                    id={optionId}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() =>
                      setHighlighted(flat.findIndex((f) => f.optionId === optionId))
                    }
                    onClick={item.onSelect}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      height: 40,
                      px: 3,
                      borderRadius: `${radius.md}px`,
                      cursor: 'pointer',
                      backgroundColor: isActive ? n[100] : 'transparent',
                    }}
                  >
                    {item.icon && (
                      <Box sx={{ display: 'inline-flex', color: theme.palette.text.secondary }}>
                        <Icon name={item.icon} size={16} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, ...typeScale.textSm, minWidth: 0 }}>
                      <HighlightMatch text={item.label} query={query} />
                    </Box>
                    {item.hint && (
                      <Box
                        component="kbd"
                        sx={{
                          ...typeScale.labelXs,
                          color: theme.palette.text.secondary,
                          border: `1px solid ${n[200]}`,
                          borderRadius: `${radius.sm}px`,
                          px: 1.5,
                          py: 0.5,
                        }}
                      >
                        {item.hint}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))
        )}
      </Box>
    </MuiDialog>
  );
}
