import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme } from '@/test/renderWithTheme';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteGroup } from './CommandPalette';
import { SearchBar } from './SearchBar';

const GROUP: CommandPaletteGroup = {
  heading: 'Navigation',
  items: [
    { icon: 'dashboard', label: 'Go to Dashboard', onSelect: vi.fn() },
    { icon: 'bell', label: 'Go to Notifications', hint: 'G N', onSelect: vi.fn() },
  ],
};

function PaletteHarness({ initialGroups = [] as CommandPaletteGroup[] }) {
  const [query, setQuery] = useState('');
  return (
    <CommandPalette
      open
      onClose={vi.fn()}
      query={query}
      onQueryChange={setQuery}
      groups={query ? initialGroups : []}
      recentItems={query ? [] : [{ label: 'stripe', onSelect: vi.fn() }]}
    />
  );
}

describe('CommandPalette', () => {
  it('wires the combobox/listbox ARIA pattern', () => {
    renderWithTheme(<PaletteHarness />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Command palette results' })).toBeInTheDocument();
  });

  it('shows recent items when the query is empty, and groups once typed', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PaletteHarness initialGroups={[GROUP]} />);
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'stripe' })).toBeInTheDocument();

    await user.type(screen.getByRole('combobox'), 'dash');
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.queryByText('Recent')).not.toBeInTheDocument();
  });

  it('highlights the matched substring in results', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PaletteHarness initialGroups={[GROUP]} />);
    await user.type(screen.getByRole('combobox'), 'Dashboard');
    const option = screen.getByRole('option', { name: /Go to Dashboard/ });
    expect(option.querySelector('span')).toBeInTheDocument();
  });

  it('defaults activedescendant to the first result and Enter selects it', async () => {
    const user = userEvent.setup();
    const onSelectFirst = vi.fn();
    const onSelectSecond = vi.fn();
    const groups: CommandPaletteGroup[] = [
      {
        heading: 'Navigation',
        items: [
          { label: 'First', onSelect: onSelectFirst },
          { label: 'Second', onSelect: onSelectSecond },
        ],
      },
    ];
    function Harness() {
      const [query, setQuery] = useState('x');
      return (
        <CommandPalette
          open
          onClose={vi.fn()}
          query={query}
          onQueryChange={setQuery}
          groups={groups}
        />
      );
    }
    renderWithTheme(<Harness />);
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    const first = screen.getByRole('option', { name: 'First' });
    expect(combobox).toHaveAttribute('aria-activedescendant', first.id);
    await user.keyboard('{Enter}');
    expect(onSelectFirst).toHaveBeenCalledOnce();
    expect(onSelectSecond).not.toHaveBeenCalled();
  });

  it('ArrowDown moves aria-activedescendant to the next result', async () => {
    const user = userEvent.setup();
    const groups: CommandPaletteGroup[] = [
      {
        heading: 'Navigation',
        items: [
          { label: 'First', onSelect: vi.fn() },
          { label: 'Second', onSelect: vi.fn() },
        ],
      },
    ];
    function Harness() {
      const [query, setQuery] = useState('x');
      return (
        <CommandPalette
          open
          onClose={vi.fn()}
          query={query}
          onQueryChange={setQuery}
          groups={groups}
        />
      );
    }
    renderWithTheme(<Harness />);
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    await user.keyboard('{ArrowDown}');
    const second = screen.getByRole('option', { name: 'Second' });
    expect(combobox).toHaveAttribute('aria-activedescendant', second.id);
  });

  it('Escape closes the palette', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <CommandPalette open onClose={onClose} query="" onQueryChange={() => {}} groups={[]} />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows a loading row and an empty-query-aware empty message', () => {
    const { rerender } = renderWithTheme(
      <CommandPalette
        open
        onClose={vi.fn()}
        query=""
        onQueryChange={() => {}}
        groups={[]}
        loading
      />,
    );
    expect(screen.getByRole('status', { name: 'Loading results' })).toBeInTheDocument();

    rerender(
      <CommandPalette open onClose={vi.fn()} query="zzz" onQueryChange={() => {}} groups={[]} />,
    );
    expect(screen.getByText('No matches for "zzz"')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<PaletteHarness initialGroups={[GROUP]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('SearchBar', () => {
  function Harness({ loading = false }: { loading?: boolean }) {
    const [value, setValue] = useState('');
    return (
      <SearchBar
        label="Search jobs"
        value={value}
        onChange={setValue}
        hotkeyHint="⌘K"
        loading={loading}
        filters={<button>Filters</button>}
      />
    );
  }

  it('composes SearchField (debounce/clear semantics untouched) plus filters slot', () => {
    renderWithTheme(<Harness />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('loading state hides the hotkey hint and shows a spinner', () => {
    renderWithTheme(<Harness loading />);
    expect(screen.queryByText('⌘K')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Searching' })).toBeInTheDocument();
  });
});
