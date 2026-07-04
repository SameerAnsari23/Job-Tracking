import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, screen as sbScreen } from '@storybook/test';
import { Dialog } from './Dialog';
import { Drawer } from './Drawer';
import { Popover } from './Popover';
import { Dropdown } from './Dropdown';
import { Stack } from './Stack';
import { Button } from '../foundation/Button';
import { Typography } from '../foundation/Typography';
import { TextField } from '../forms/TextField';
import { Icon } from '../foundation/Icon';

const meta: Meta = { title: 'Layout/Overlays' };
export default meta;

function DialogDemo({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete discovery profile"
        description="Its watchlist and matching rules will stop immediately. This can't be undone."
        dismissible={dismissible}
        actions={
          <>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete profile
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </>
        }
      />
    </>
  );
}

export const Dialogs: StoryObj = { render: () => <DialogDemo /> };

function FormDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open form dialog (lg)</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Add experience"
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <Stack gap={5}>
          <TextField label="Job title" />
          <TextField label="Company" />
        </Stack>
      </Dialog>
    </>
  );
}

export const FormDialog: StoryObj = { render: () => <FormDialogDemo /> };

export const DialogFocusTrap: StoryObj = {
  render: () => <DialogDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    // Dialog portals to body — assert with the global screen.
    const dialog = await sbScreen.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName('Delete discovery profile');
    await userEvent.keyboard('{Escape}');
    await expect(sbScreen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

function DrawerDemo({ side }: { side: 'left' | 'right' | 'bottom' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open {side} drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        title="Notifications"
        footer={
          <Button variant="ghost" fullWidth>
            View all notifications
          </Button>
        }
      >
        <Stack gap={4}>
          {Array.from({ length: 12 }, (_, i) => (
            <Typography key={i} variant="textSm">
              Notification row {i + 1} — the body scrolls, header and footer stay pinned.
            </Typography>
          ))}
        </Stack>
      </Drawer>
    </>
  );
}

export const Drawers: StoryObj = {
  render: () => (
    <Stack direction="row" gap={4}>
      <DrawerDemo side="right" />
      <DrawerDemo side="left" />
      <DrawerDemo side="bottom" />
    </Stack>
  ),
};

export const Popovers: StoryObj = {
  render: () => (
    <Stack direction="row" gap={6} align="center">
      <Popover
        trigger={<Button variant="secondary">Click popover</Button>}
        placement="bottom-start"
      >
        <Typography variant="textSm">Anchored panel content.</Typography>
      </Popover>
      <Popover
        trigger={
          <Typography variant="textMd" color="accent">
            Hover: Stripe
          </Typography>
        }
        openOn="hover"
        hoverDelayMs={300}
      >
        <Stack gap={2}>
          <Typography variant="h6">Stripe</Typography>
          <Typography variant="textSm" color="secondary">
            142 open roles
          </Typography>
        </Stack>
      </Popover>
    </Stack>
  ),
};

export const Menus: StoryObj = {
  render: () => (
    <Dropdown
      aria-label="Job actions"
      trigger={
        <Button variant="ghost" iconOnly aria-label="More actions">
          <Icon name="more" size={18} />
        </Button>
      }
      items={[
        { icon: 'externalLink', label: 'Copy link', onSelect: () => {} },
        { icon: 'bookmark', label: 'Save job', onSelect: () => {} },
        { icon: 'trash', label: 'Delete', onSelect: () => {}, destructive: true, divider: true },
      ]}
    />
  ),
};

export const MenuKeyboard: StoryObj = {
  render: () => (
    <Dropdown
      aria-label="Actions"
      trigger={<Button variant="secondary">Actions</Button>}
      items={[
        { label: 'First', onSelect: () => {} },
        { label: 'Second', onSelect: () => {} },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await sbScreen.findByRole('menu');
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
    await expect(sbScreen.queryByRole('menu')).not.toBeInTheDocument();
  },
};
