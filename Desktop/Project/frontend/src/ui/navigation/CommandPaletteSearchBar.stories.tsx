import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within, screen as sbScreen } from '@storybook/test';
import Box from '@mui/material/Box';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteGroup } from './CommandPalette';
import { SearchBar } from './SearchBar';
import { Button } from '../foundation/Button';
import { Chip } from '../foundation/Chip';

const meta: Meta = { title: 'Navigation/CommandPalette · SearchBar' };
export default meta;

const NAV_GROUP: CommandPaletteGroup = {
  heading: 'Navigation',
  items: [
    { icon: 'dashboard', label: 'Go to Dashboard', onSelect: fn() },
    { icon: 'radar', label: 'Go to Discovery', onSelect: fn() },
    { icon: 'bell', label: 'Go to Notifications', hint: 'G N', onSelect: fn() },
  ],
};

function PaletteDemo({ loading = false, empty = false }: { loading?: boolean; empty?: boolean }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={setQuery}
        groups={empty ? [] : query ? [NAV_GROUP] : []}
        recentItems={
          query
            ? []
            : [
                { icon: 'search', label: 'stripe', onSelect: fn() },
                { icon: 'search', label: 'notion', onSelect: fn() },
              ]
        }
        loading={loading}
      />
    </>
  );
}

export const Default: StoryObj = { render: () => <PaletteDemo /> };
export const Loading: StoryObj = { render: () => <PaletteDemo loading /> };
export const EmptyResults: StoryObj = {
  render: function EmptyResultsStory() {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState('xyz-no-match');
    return (
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={setQuery}
        groups={[]}
      />
    );
  },
};

export const KeyboardJourney: StoryObj = {
  render: () => <PaletteDemo />,
  play: async () => {
    const dialog = await sbScreen.findByRole('dialog', { name: 'Command palette' });
    const combobox = within(dialog).getByRole('combobox');
    await userEvent.type(combobox, 'notif');
    const options = await within(dialog).findAllByRole('option');
    await expect(options.length).toBeGreaterThan(0);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
  },
};

function SearchBarDemo() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <Box sx={{ maxWidth: 480 }}>
      <SearchBar
        label="Search jobs"
        value={value}
        onChange={setValue}
        onDebouncedChange={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 400);
        }}
        placeholder="Search jobs, companies…"
        hotkeyHint="⌘K"
        loading={loading}
        filters={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label="Remote" onToggle={() => {}} />
            <Chip label="Full-time" onToggle={() => {}} />
          </Box>
        }
      />
    </Box>
  );
}

export const SearchBarWithFilters: StoryObj = { render: () => <SearchBarDemo /> };
