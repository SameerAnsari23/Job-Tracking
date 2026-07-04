import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '@/test/renderWithTheme';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { Checkbox } from './Checkbox';
import { Select } from './Select';
import { FormLayout } from './FormLayout';
import { FormSection } from './FormSection';
import { Button } from '../foundation/Button';

/**
 * React Hook Form + Zod compatibility suite (Phase 16.4 F-contract):
 * register() for native-input components, Controller for proxied controls,
 * zod messages surfacing through the error prop, reset(), nested names,
 * dirty/touched behavior, and server-error mapping via setError().
 */

const schema = z.object({
  email: z.string().email('Must be a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  sort: z.string().min(1, 'Choose a sort order.'),
  profile: z.object({
    headline: z.string().max(10, 'Too long.').optional(),
  }),
  terms: z.boolean().refine((v) => v, { message: 'You must accept the terms.' }),
});

type FormData = z.infer<typeof schema>;

function TestForm({ onValid }: { onValid: (data: FormData) => void }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      sort: '',
      profile: { headline: '' },
      terms: false,
    },
  });

  return (
    <FormLayout
      onSubmit={handleSubmit(onValid)}
      footer={
        <>
          <Button variant="ghost" onClick={() => reset()}>
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() => setError('email', { message: 'Email already registered.' })}
          >
            Simulate server error
          </Button>
          <Button type="submit">Submit</Button>
        </>
      }
    >
      <FormSection title="Account">
        <TextField label="Email" {...register('email')} error={errors.email?.message} />
        <PasswordField
          label="Password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Controller
          control={control}
          name="sort"
          render={({ field }) => (
            <Select
              label="Sort"
              placeholder="Choose…"
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'oldest', label: 'Oldest' },
              ]}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.sort?.message}
            />
          )}
        />
        <TextField
          label="Headline"
          {...register('profile.headline')}
          error={errors.profile?.headline?.message}
        />
        <Checkbox label="Accept terms" {...register('terms')} error={errors.terms?.message} />
      </FormSection>
      <output data-testid="dirty">{String(isDirty)}</output>
    </FormLayout>
  );
}

describe('RHF + Zod integration', () => {
  it('surfaces zod messages on invalid submit — field-level errors on every component class', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    renderWithTheme(<TestForm onValid={onValid} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Must be a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Choose a sort order.')).toBeInTheDocument();
    expect(screen.getByText('You must accept the terms.')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it('submits valid data through register + Controller, including nested names', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    renderWithTheme(<TestForm onValid={onValid} />);

    await user.type(screen.getByLabelText('Email'), 'sam@expertbridge.co.in');
    await user.type(screen.getByLabelText('Password'), 'hunter2!');
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Newest' }));
    await user.type(screen.getByLabelText('Headline'), 'PM');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onValid).toHaveBeenCalledOnce());
    // handleSubmit invokes onValid(data, event) — assert on the data arg.
    expect(onValid.mock.calls[0]![0]).toEqual(
      expect.objectContaining({
        email: 'sam@expertbridge.co.in',
        sort: 'newest',
        profile: { headline: 'PM' },
        terms: true,
      }),
    );
  });

  it('validates nested field names (profile.headline max length)', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onValid={vi.fn()} />);
    await user.type(screen.getByLabelText('Headline'), 'this is far too long');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Too long.')).toBeInTheDocument();
  });

  it('tracks dirty state and reset() restores defaults', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onValid={vi.fn()} />);
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');

    await user.type(screen.getByLabelText('Email'), 'x');
    expect(screen.getByTestId('dirty')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByTestId('dirty')).toHaveTextContent('false');
    expect(screen.getByLabelText('Email')).toHaveValue('');
  });

  it('maps server-side errors via setError() into the same field error slot', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TestForm onValid={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Simulate server error' }));
    expect(await screen.findByText('Email already registered.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});
