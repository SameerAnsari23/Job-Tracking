import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Autocomplete } from './Autocomplete';
import type { AutocompleteOption } from './Autocomplete';
import { MultiSelect } from './MultiSelect';
import { DatePicker } from './DatePicker';
import { RangeSlider } from './RangeSlider';
import { TagInput } from './TagInput';
import { FileUpload } from './FileUpload';
import type { UploadedFileMeta } from './FileUpload';

const meta: Meta = { title: 'Forms/Composite' };
export default meta;

const SKILLS: AutocompleteOption[] = [
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go', description: 'Backend systems language' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'postgresql', label: 'PostgreSQL' },
];

export const Autocompletes: StoryObj = {
  render: function AutocompletesStory() {
    const [value, setValue] = useState<AutocompleteOption | null>(null);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
        <Autocomplete
          label="Primary skill"
          options={SKILLS}
          value={value}
          onChange={setValue}
          placeholder="Type to search…"
        />
        <Autocomplete
          label="Loading options"
          options={[]}
          value={null}
          onChange={() => {}}
          loading
        />
        <Autocomplete
          label="With error"
          options={SKILLS}
          value={null}
          onChange={() => {}}
          error="Choose a skill."
        />
      </Box>
    );
  },
};

export const MultiSelects: StoryObj = {
  render: function MultiSelectsStory() {
    const [value, setValue] = useState<AutocompleteOption[]>([SKILLS[0]!, SKILLS[1]!]);
    return (
      <Box sx={{ maxWidth: 420 }}>
        <MultiSelect
          label="Required skills"
          options={SKILLS}
          value={value}
          onChange={setValue}
          maxSelected={3}
          placeholder="Add skills…"
          helperText="Up to 3 — additional options disable at the cap."
        />
      </Box>
    );
  },
};

export const DatePickers: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 300 }}>
      <DatePicker label="Start date" monthYearOnly disableFuture />
      <DatePicker label="Full date" />
      <DatePicker label="With error" error="Start date is required." />
    </Box>
  ),
};

const salary = (v: number) => `$${v.toLocaleString()}`;

export const RangeSliders: StoryObj = {
  render: function RangeSlidersStory() {
    const [value, setValue] = useState<[number, number]>([80_000, 200_000]);
    return (
      <Box sx={{ maxWidth: 360 }}>
        <RangeSlider
          label="Salary range"
          min={0}
          max={400_000}
          step={5_000}
          value={value}
          onChange={setValue}
          format={salary}
        />
      </Box>
    );
  },
};

export const TagInputs: StoryObj = {
  render: function TagInputsStory() {
    const [tags, setTags] = useState<string[]>(['Go', 'PostgreSQL']);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <TagInput
          label="Skills"
          value={tags}
          onChange={setTags}
          maxTags={30}
          placeholder="Type and press Enter…"
          validateTag={(tag) => (tag.includes('/') ? 'Skill names must not contain "/".' : null)}
        />
        <TagInput label="Disabled" value={['Locked']} onChange={() => {}} disabled />
      </Box>
    );
  },
};

export const TagInputKeyboard: StoryObj = {
  render: function TagInputKeyboardStory() {
    const [tags, setTags] = useState<string[]>(['React']);
    return <TagInput label="Skills" value={tags} onChange={setTags} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Skills');
    await userEvent.type(input, 'Go{Enter}');
    await expect(canvas.getByText('Go')).toBeInTheDocument();
    // Backspace on empty pulls the last tag back for editing.
    await userEvent.keyboard('{Backspace}');
    await expect(input).toHaveValue('Go');
  },
};

export const FileUploads: StoryObj = {
  render: function FileUploadsStory() {
    const [file, setFile] = useState<UploadedFileMeta | null>(null);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <FileUpload
          label="Upload your resume"
          accept=".pdf,.docx"
          maxSize={5 * 1024 * 1024}
          file={file}
          onFile={(f) => setFile({ name: f.name, size: f.size, type: f.type })}
          onRemove={() => setFile(null)}
        />
        <FileUpload
          label="Selected state"
          onFile={() => {}}
          file={{ name: 'sam-ansari-resume.pdf', size: 182_000, type: 'application/pdf' }}
          onRemove={() => {}}
        />
        <FileUpload label="Error state" onFile={() => {}} error="Upload failed — try again." />
      </Box>
    );
  },
};
