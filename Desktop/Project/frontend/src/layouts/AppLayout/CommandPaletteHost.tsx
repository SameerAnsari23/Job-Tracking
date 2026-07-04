import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { CommandPalette } from '@/ui/navigation/CommandPalette';
import { Icon } from '@/ui/foundation/Icon';
import { ALL_NAV_ITEMS } from './navItems';

const HOTKEY_LABEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';

/**
 * Global Cmd/Ctrl+K navigation palette, plus its own visible trigger button
 * (rendered in TopNavigation's `search` slot). Scope is deliberately
 * limited to jumping between existing routes — no job/company search,
 * which would be Dashboard/Job Search business logic, out of scope here.
 */
export function CommandPaletteHost() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  const items = ALL_NAV_ITEMS.filter((item) =>
    query ? item.label.toLowerCase().includes(query.toLowerCase()) : true,
  ).map((item) => ({
    icon: item.icon,
    label: `Go to ${item.label}`,
    onSelect: () => goTo(item.path),
  }));

  return (
    <>
      <ButtonBase
        aria-label="Open command palette"
        onClick={() => setOpen(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          height: 36,
          px: 3,
          borderRadius: 1.5,
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
          minWidth: 200,
        }}
      >
        <Icon name="search" size={16} />
        <Box component="span" sx={{ fontSize: 13, flex: 1, textAlign: 'left' }}>
          Search
        </Box>
        <Box
          component="kbd"
          sx={{
            fontSize: 11,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            px: 1,
            py: 0.25,
          }}
        >
          {HOTKEY_LABEL}
        </Box>
      </ButtonBase>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={setQuery}
        groups={items.length > 0 ? [{ heading: 'Navigation', items }] : []}
        placeholder="Jump to a page…"
        emptyMessage="No matching pages"
      />
    </>
  );
}
