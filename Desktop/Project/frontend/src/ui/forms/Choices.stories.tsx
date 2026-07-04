import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { Switch } from './Switch';
import { Select } from './Select';

const meta: Meta = { title: 'Forms/Choices' };
export default meta;

export const Checkboxes: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 360 }}>
      <Checkbox label="Email notifications" defaultChecked />
      <Checkbox label="With description" description="A daily summary of new matches." />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Error state" error="You must accept the terms." />
    </Box>
  ),
};

export const Radios: StoryObj = {
  render: function RadiosStory() {
    const [value, setValue] = useState('remote');
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <RadioGroup
          label="Workplace preference"
          value={value}
          onChange={setValue}
          options={[
            { value: 'remote', label: 'Remote', description: 'Work from anywhere.' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'onsite', label: 'On-site' },
            { value: 'any', label: 'Any', disabled: true },
          ]}
        />
        <RadioGroup
          label="Row layout"
          row
          defaultValue="newest"
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
        <RadioGroup
          label="With error"
          error="Choose a workplace preference."
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
        />
      </Box>
    );
  },
};

export const RadioKeyboard: StoryObj = {
  render: function RadioKeyboardStory() {
    const [value, setValue] = useState('remote');
    return (
      <RadioGroup
        label="Keyboard demo"
        value={value}
        onChange={setValue}
        options={[
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remote = canvas.getByRole('radio', { name: /Remote/ });
    remote.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: /Hybrid/ })).toBeChecked();
  },
};

export const Switches: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 420 }}>
      <Switch label="Open to work" defaultChecked />
      <Switch label="With description" description="Recruiters can see your profile." />
      <Switch label="Saving state" defaultChecked saveState="saving" />
      <Switch label="Saved state" defaultChecked saveState="saved" />
      <Switch label="Save failed" saveState="error" />
      <Switch label="Disabled" disabled />
      <Switch label="Label first" labelPlacement="start" />
    </Box>
  ),
};

const SELECT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'updated', label: 'Recently updated', description: 'Sorted by last content change' },
];

export const Selects: StoryObj = {
  render: function SelectsStory() {
    const [value, setValue] = useState('');
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 320 }}>
        <Select
          label="Sort order"
          placeholder="Choose…"
          options={SELECT_OPTIONS}
          value={value}
          onChange={setValue}
        />
        <Select label="Preselected" options={SELECT_OPTIONS} value="newest" onChange={() => {}} />
        <Select
          label="Error"
          options={SELECT_OPTIONS}
          value=""
          onChange={() => {}}
          error="Pick a sort order."
        />
        <Select label="Disabled" options={SELECT_OPTIONS} value="" onChange={() => {}} disabled />
      </Box>
    );
  },
};

export const SelectKeyboard: StoryObj = {
  render: function SelectKeyboardStory() {
    const [value, setValue] = useState('');
    return (
      <Select
        label="Sort order"
        placeholder="Choose…"
        options={SELECT_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    // Listbox renders in a portal — query the document body.
    const listbox = within(document.body);
    const option = await listbox.findByRole('option', { name: /Oldest first/ });
    await userEvent.click(option);
    await expect(trigger).toHaveTextContent('Oldest first');
  },
};
