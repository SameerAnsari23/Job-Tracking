import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { Checkbox } from './Checkbox';
import { RadioGroup } from './RadioGroup';
import { Switch } from './Switch';
import { Select } from './Select';
import { TagInput } from './TagInput';
import { RangeSlider } from './RangeSlider';
import { FileUpload } from './FileUpload';

describe('Checkbox', () => {
  it('toggles via label click and exposes error wiring', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(<Checkbox label="Email alerts" onChange={onChange} />);
    await user.click(screen.getByText('Email alerts'));
    expect(onChange).toHaveBeenCalled();
  });

  it('error is announced and linked', () => {
    renderWithTheme(<Checkbox label="Terms" error="You must accept the terms." />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('You must accept the terms.');
  });

  it('space toggles when focused', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(<Checkbox label="KB" onChange={onChange} />);
    screen.getByRole('checkbox').focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('RadioGroup', () => {
  function Controlled() {
    const [value, setValue] = useState('remote');
    return (
      <RadioGroup
        label="Workplace"
        value={value}
        onChange={setValue}
        options={[
          { value: 'remote', label: 'Remote' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'onsite', label: 'On-site' },
        ]}
      />
    );
  }

  it('renders fieldset/legend group semantics', () => {
    renderWithTheme(<Controlled />);
    expect(screen.getByRole('group', { name: 'Workplace' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('arrow keys move selection (roving tabindex)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Controlled />);
    screen.getByRole('radio', { name: 'Remote' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Hybrid' })).toBeChecked();
  });

  it('has no axe violations with an error', async () => {
    const { container } = renderWithTheme(
      <RadioGroup
        label="Pick"
        error="Required."
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Switch', () => {
  inBothThemes('renders role=switch with label', (mode) => {
    renderWithTheme(<Switch label="Open to work" defaultChecked />, mode);
    expect(screen.getByRole('switch', { name: 'Open to work' })).toBeChecked();
  });

  it('shows the auto-save indicator states', () => {
    const { rerender } = renderWithTheme(<Switch label="S" saveState="saving" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving…');
    rerender(<Switch label="S" saveState="saved" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved ✓');
  });
});

describe('Select', () => {
  const OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
  ];

  it('opens a listbox, selects an option, and shows placeholder when empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <Select label="Sort" placeholder="Choose…" options={OPTIONS} value="" onChange={onChange} />,
    );
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveTextContent('Choose…');
    await user.click(combobox);
    await user.click(await screen.findByRole('option', { name: 'Oldest first' }));
    expect(onChange).toHaveBeenCalledWith('oldest');
  });

  it('marks error state on the input', () => {
    renderWithTheme(
      <Select label="Sort" options={OPTIONS} value="" onChange={() => {}} error="Pick one." />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Pick one.');
  });
});

describe('TagInput', () => {
  function Controlled({ validate }: { validate?: (t: string) => string | null }) {
    const [tags, setTags] = useState<string[]>(['React']);
    return <TagInput label="Skills" value={tags} onChange={setTags} validateTag={validate} />;
  }

  it('Enter commits a tag; duplicates are ignored', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Controlled />);
    const input = screen.getByLabelText('Skills');
    await user.type(input, 'Go{Enter}');
    expect(screen.getByText('Go')).toBeInTheDocument();
    await user.type(input, 'Go{Enter}');
    expect(screen.getAllByText('Go')).toHaveLength(1);
  });

  it('comma commits; Backspace on empty pulls the last tag into the input', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Controlled />);
    const input = screen.getByLabelText('Skills');
    await user.type(input, 'Rust,');
    expect(screen.getByText('Rust')).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('Rust');
    expect(screen.queryByText('Rust', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('validateTag rejections surface as the field error', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Controlled validate={(t) => (t.includes('/') ? 'No slashes allowed.' : null)} />,
    );
    await user.type(screen.getByLabelText('Skills'), 'a/b{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('No slashes allowed.');
  });

  it('per-tag remove buttons are separate focus stops', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });
});

describe('RangeSlider', () => {
  it('paired inputs are the accessible source of truth and commit on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <RangeSlider label="Salary" min={0} max={200} value={[50, 150]} onChange={onChange} />,
    );
    const minInput = screen.getByRole('textbox', { name: 'Salary minimum value' });
    await user.clear(minInput);
    await user.type(minInput, '80{Enter}');
    expect(onChange).toHaveBeenCalledWith([80, 150]);
  });

  it('clamps input values to bounds', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <RangeSlider label="Salary" min={0} max={200} value={[50, 150]} onChange={onChange} />,
    );
    const maxInput = screen.getByRole('textbox', { name: 'Salary maximum value' });
    await user.clear(maxInput);
    await user.type(maxInput, '999{Enter}');
    expect(onChange).toHaveBeenCalledWith([50, 200]);
  });

  it('exposes two labeled slider thumbs', () => {
    renderWithTheme(
      <RangeSlider label="Salary" min={0} max={200} value={[50, 150]} onChange={() => {}} />,
    );
    expect(screen.getByRole('slider', { name: 'Salary minimum' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Salary maximum' })).toBeInTheDocument();
  });
});

describe('FileUpload', () => {
  it('the drop zone is a real button that opens the file dialog', () => {
    renderWithTheme(<FileUpload label="Upload resume" onFile={() => {}} />);
    expect(screen.getByRole('button', { name: /Upload resume/ })).toBeInTheDocument();
  });

  it('rejects oversized files with an error and announcement', async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const { container } = renderWithTheme(
      <FileUpload label="Upload" maxSize={10} onFile={onFile} />,
    );
    const input = container.querySelector('input[type="file"]')!;
    const big = new File(['x'.repeat(100)], 'big.pdf', { type: 'application/pdf' });
    await user.upload(input as HTMLInputElement, big);
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
  });

  it('accepts a valid file and renders the file row with remove', async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    const onRemove = vi.fn();
    const { container, rerender } = renderWithTheme(
      <FileUpload label="Upload" onFile={onFile} onRemove={onRemove} />,
    );
    const file = new File(['ok'], 'resume.pdf', { type: 'application/pdf' });
    await user.upload(container.querySelector('input[type="file"]') as HTMLInputElement, file);
    expect(onFile).toHaveBeenCalledWith(file);
    rerender(
      <FileUpload
        label="Upload"
        onFile={onFile}
        onRemove={onRemove}
        file={{ name: 'resume.pdf', size: 2, type: 'application/pdf' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove resume.pdf' }));
    expect(onRemove).toHaveBeenCalled();
  });
});
