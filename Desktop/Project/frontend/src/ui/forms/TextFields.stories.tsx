import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { SearchField } from './SearchField';
import { Textarea } from './Textarea';
import { Icon } from '../foundation/Icon';

const meta: Meta = { title: 'Forms/Text Fields' };
export default meta;

export const TextFieldStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
      <TextField label="Email" placeholder="you@company.com" type="email" />
      <TextField label="Required" required placeholder="Required field" />
      <TextField label="With helper" helperText="We never share your email." />
      <TextField label="Error" error="Must be a valid email address." defaultValue="not-an-email" />
      <TextField label="Warning" warning="This domain looks unusual." defaultValue="a@b.xyz" />
      <TextField label="Success" success="Email confirmed." defaultValue="sam@expertbridge.co.in" />
      <TextField label="Disabled" disabled defaultValue="Locked value" />
      <TextField label="Icon start" iconStart={<Icon name="mail" size={16} />} />
      <TextField
        label="Very long label that wraps to demonstrate label layout behavior under constraint"
        placeholder="Long label case"
      />
    </Box>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
      <TextField label="Small (36px)" size="sm" />
      <TextField label="Medium (40px)" size="md" />
      <TextField label="Large (44px — auth flows)" size="lg" />
    </Box>
  ),
};

function CounterDemo() {
  const [value, setValue] = useState('This headline is approaching the limit soon');
  return (
    <TextField
      label="Headline"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxLength={50}
      showCount
      helperText="Counter appears at 80% consumption."
    />
  );
}
export const CharacterCounter: StoryObj = { render: () => <CounterDemo /> };

export const Password: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
      <PasswordField label="Password" autoComplete="new-password" />
      <PasswordField
        label="With strength meter"
        strength={2}
        strengthHint="Add a number or symbol."
        autoComplete="new-password"
      />
      <PasswordField label="Error" error="Password is required." />
    </Box>
  ),
};

export const PasswordVisibilityToggle: StoryObj = {
  render: () => <PasswordField label="Password" defaultValue="hunter2" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Show password' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

function SearchDemo({ onDebounced }: { onDebounced: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SearchField
      label="Search companies"
      value={value}
      onChange={setValue}
      onDebouncedChange={onDebounced}
      placeholder="Search companies…"
      hotkeyHint="⌘K"
    />
  );
}

export const Search: StoryObj = {
  render: () => <SearchDemo onDebounced={fn()} />,
};

export const TextareaStates: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420 }}>
      <Textarea label="Description" placeholder="Describe the role…" />
      <Textarea
        label="With counter"
        defaultValue={'A'.repeat(1700)}
        valueLength={1700}
        maxLength={2000}
        showCount
      />
      <Textarea label="Error" error="Description is required." />
    </Box>
  ),
};
