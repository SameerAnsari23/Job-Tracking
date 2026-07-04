import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { SearchField } from './SearchField';
import { Textarea } from './Textarea';
import { ValidationMessage } from './ValidationMessage';

describe('TextField', () => {
  inBothThemes('wires label, control, and message ids', (mode) => {
    renderWithTheme(<TextField label="Email" helperText="We never share it." required />, mode);
    const input = screen.getByLabelText(/Email/);
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(screen.getByText('We never share it.')).toBeInTheDocument();
  });

  it('error state sets aria-invalid and renders role=alert', () => {
    renderWithTheme(<TextField label="Email" error="Must be a valid email address." />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Must be a valid email address.');
  });

  it('message priority: error wins over warning/success/helper', () => {
    renderWithTheme(<TextField label="F" error="E" warning="W" success="S" helperText="H" />);
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.queryByText('W')).not.toBeInTheDocument();
    expect(screen.queryByText('H')).not.toBeInTheDocument();
  });

  it('counter appears only at 80% of maxLength', () => {
    const { rerender } = renderWithTheme(
      <TextField label="F" value={'x'.repeat(10)} onChange={() => {}} maxLength={100} showCount />,
    );
    expect(screen.queryByText('10/100')).not.toBeInTheDocument();
    rerender(
      <TextField label="F" value={'x'.repeat(85)} onChange={() => {}} maxLength={100} showCount />,
    );
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('supports uncontrolled usage with defaultValue', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TextField label="Name" defaultValue="Sam" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveValue('Sam');
    await user.type(input, ' A');
    expect(input).toHaveValue('Sam A');
  });

  it('has no axe violations in all validation states', async () => {
    const { container } = renderWithTheme(
      <>
        <TextField label="A" helperText="h" />
        <TextField label="B" error="e" />
        <TextField label="C" disabled />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('PasswordField', () => {
  it('visibility toggle switches input type and aria-pressed', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PasswordField label="Password" defaultValue="secret" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('renders the advisory strength meter with meter semantics', () => {
    renderWithTheme(<PasswordField label="P" strength={2} strengthHint="Add a symbol." />);
    const meter = screen.getByRole('meter', { name: 'Password strength' });
    expect(meter).toHaveAttribute('aria-valuenow', '2');
    expect(screen.getByText('Add a symbol.')).toBeInTheDocument();
  });
});

describe('SearchField', () => {
  it('debounces onDebouncedChange and clears via the × button', async () => {
    const user = userEvent.setup();
    const onDebounced = vi.fn();
    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <SearchField
          label="Search"
          value={value}
          onChange={setValue}
          onDebouncedChange={onDebounced}
          debounceMs={50}
        />
      );
    }
    renderWithTheme(<Wrapper />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'stripe');
    // Typing is faster than the debounce window — nothing fired yet.
    expect(onDebounced).not.toHaveBeenCalledWith('stripe');
    await waitFor(() => expect(onDebounced).toHaveBeenCalledWith('stripe'));
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
  });

  it('Enter fires onSearch immediately', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderWithTheme(
      <SearchField label="Search" value="notion" onChange={() => {}} onSearch={onSearch} />,
    );
    screen.getByRole('searchbox').focus();
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledWith('notion');
  });
});

describe('Textarea', () => {
  it('renders multiline with counter', () => {
    renderWithTheme(
      <Textarea
        label="Bio"
        value={'y'.repeat(1800)}
        onChange={() => {}}
        maxLength={2000}
        showCount
      />,
    );
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA');
    expect(screen.getByText('1800/2000')).toBeInTheDocument();
  });
});

describe('ValidationMessage', () => {
  it('error tone uses role=alert; success uses role=status', () => {
    renderWithTheme(
      <>
        <ValidationMessage tone="error">Bad</ValidationMessage>
        <ValidationMessage tone="success">Good</ValidationMessage>
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
    expect(screen.getByRole('status')).toHaveTextContent('Good');
  });
});
