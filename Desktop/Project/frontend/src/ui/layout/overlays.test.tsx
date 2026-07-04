import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme } from '@/test/renderWithTheme';
import { Dialog } from './Dialog';
import { Drawer } from './Drawer';
import { Popover } from './Popover';
import { Dropdown } from './Dropdown';
import { Accordion } from './Accordion';
import { SplitPane } from './SplitPane';
import { ResizablePanel } from './ResizablePanel';
import { Button } from '../foundation/Button';
import { TextField } from '../forms/TextField';

function DialogHarness({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete profile"
        description="This can't be undone."
        dismissible={dismissible}
        actions={
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        }
      >
        <TextField label="Reason" />
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('wires aria-modal, labelledby, and describedby', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Delete profile');
    expect(dialog).toHaveAccessibleDescription("This can't be undone.");
  });

  it('traps focus inside the dialog', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    // Tab repeatedly — focus must stay within the dialog.
    for (let i = 0; i < 5; i += 1) {
      await user.tab();
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    }
  });

  it('Escape closes and focus returns to the trigger', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('non-dismissible dialogs ignore Escape and backdrop', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness dismissible={false} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Explicit action still closes.
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('locks body scroll while open', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('has no axe violations', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(await axe(dialog)).toHaveNoViolations();
  });
});

function DrawerHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Notifications"
        footer={<span>footer</span>}
      >
        <span>drawer body</span>
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('opens with a labelled dialog, close button, and pinned footer', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DrawerHarness />);
    await user.click(screen.getByRole('button', { name: 'Open drawer' }));
    const drawer = await screen.findByRole('dialog');
    expect(drawer).toHaveAccessibleName('Notifications');
    expect(screen.getByText('footer')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close Notifications' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('restores focus to the trigger on close', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DrawerHarness />);
    const trigger = screen.getByRole('button', { name: 'Open drawer' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe('Popover', () => {
  it('click mode toggles with aria-expanded and closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover trigger={<Button variant="secondary">Info</Button>}>
        <span>popover content</span>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Info' }));
    expect(await screen.findByText('popover content')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('popover content')).not.toBeInTheDocument());
  });

  it('hover mode opens on focus without stealing it', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Popover trigger={<Button variant="secondary">Stripe</Button>} openOn="hover">
        <span>142 open roles</span>
      </Popover>,
    );
    await user.tab();
    expect(await screen.findByText('142 open roles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stripe' })).toHaveFocus();
  });
});

describe('Menu / Dropdown', () => {
  it('opens a role=menu, selects an item, and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithTheme(
      <Dropdown
        trigger={<Button variant="secondary">Actions</Button>}
        items={[
          { label: 'Copy link', onSelect },
          { label: 'Delete', onSelect: vi.fn(), destructive: true },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(await screen.findByRole('menuitem', { name: 'Copy link' }));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('arrow keys navigate menu items', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Dropdown
        trigger={<Button variant="secondary">Actions</Button>}
        items={[
          { label: 'First', onSelect: vi.fn() },
          { label: 'Second', onSelect: vi.fn() },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    // Focus the first item explicitly (MUI moves focus into the menu on an
    // async transition — timing is not deterministic in jsdom), then assert
    // the arrow-key roving contract itself.
    const first = screen.getByRole('menuitem', { name: 'First' });
    first.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Second' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(first).toHaveFocus();
  });
});

describe('Accordion', () => {
  const ITEMS = [
    { id: 'a', title: 'Section A', content: <span>content A</span> },
    { id: 'b', title: 'Section B', content: <span>content B</span> },
  ];

  it('toggles panels with button/region ARIA wiring', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Accordion items={ITEMS} />);
    const header = screen.getByRole('button', { name: 'Section A' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Section A' })).toBeInTheDocument();
  });

  it('single mode closes the other panel', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Accordion items={ITEMS} mode="single" defaultOpen={['a']} />);
    await user.click(screen.getByRole('button', { name: 'Section B' }));
    expect(screen.getByRole('button', { name: 'Section A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Section B' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});

describe('SplitPane', () => {
  it('end panel is a labelled complementary region hidden when closed', () => {
    const { rerender } = renderWithTheme(
      <SplitPane end={<span>detail</span>} endOpen={false} endLabel="Job details">
        <span>list</span>
      </SplitPane>,
    );
    const panel = document.querySelector('[data-slot="end"]')!;
    expect(panel).toHaveAttribute('aria-hidden', 'true');
    expect(panel).toHaveAttribute('data-state', 'closed');

    rerender(
      <SplitPane end={<span>detail</span>} endOpen endLabel="Job details">
        <span>list</span>
      </SplitPane>,
    );
    expect(screen.getByRole('complementary', { name: 'Job details' })).toHaveAttribute(
      'data-state',
      'open',
    );
  });
});

describe('ResizablePanel', () => {
  function Harness() {
    const [width, setWidth] = useState(280);
    return (
      <ResizablePanel
        width={width}
        onWidthChange={setWidth}
        minWidth={200}
        maxWidth={400}
        defaultWidth={280}
        step={16}
      >
        <span>panel</span>
      </ResizablePanel>
    );
  }

  it('handle exposes separator value semantics and resizes with arrows', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Harness />);
    const handle = screen.getByRole('separator', { name: 'Resize panel' });
    expect(handle).toHaveAttribute('aria-valuenow', '280');
    handle.focus();
    await user.keyboard('{ArrowRight}');
    expect(handle).toHaveAttribute('aria-valuenow', '296');
    await user.keyboard('{Home}');
    expect(handle).toHaveAttribute('aria-valuenow', '200');
    await user.keyboard('{End}');
    expect(handle).toHaveAttribute('aria-valuenow', '400');
  });

  it('double-click resets to the default width', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Harness />);
    const handle = screen.getByRole('separator');
    handle.focus();
    await user.keyboard('{End}');
    await user.dblClick(handle);
    expect(handle).toHaveAttribute('aria-valuenow', '280');
  });
});
