import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { FormLayout } from './FormLayout';
import { FormSection } from './FormSection';
import { TextField } from './TextField';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { Button } from '../foundation/Button';

/**
 * PATTERN story (Phase 16.4 Storybook §4): the canonical RHF + Zod recipe
 * every feature form follows — register() for native inputs, Controller for
 * proxied controls (Select), errors mapped from formState to field props.
 */
const meta: Meta = { title: 'Patterns/Form (RHF + Zod)' };
export default meta;

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(100),
  company: z.string().min(1, 'Company is required.').max(100),
  startDate: z.string().min(1, 'Start date is required.'),
  employment: z.string().min(1, 'Choose an employment type.'),
  description: z.string().max(2000).optional(),
  current: z.boolean(),
});

type ExperienceForm = z.infer<typeof experienceSchema>;

function ExperienceFormDemo({ onValid }: { onValid: (data: ExperienceForm) => void }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      company: '',
      startDate: '',
      employment: '',
      description: '',
      current: false,
    },
  });

  const description = watch('description') ?? '';

  return (
    <FormLayout
      onSubmit={handleSubmit(onValid)}
      footer={
        <>
          <Button variant="ghost">Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            Add experience
          </Button>
        </>
      }
    >
      <FormSection title="Role" description="What you did and where.">
        <TextField
          label="Job title"
          required
          {...register('title')}
          error={errors.title?.message}
        />
        <TextField
          label="Company"
          required
          {...register('company')}
          error={errors.company?.message}
        />
        <DatePicker
          label="Start date"
          monthYearOnly
          disableFuture
          required
          {...register('startDate')}
          error={errors.startDate?.message}
        />
        <Controller
          control={control}
          name="employment"
          render={({ field }) => (
            <Select
              label="Employment type"
              required
              placeholder="Choose…"
              options={[
                { value: 'FULL_TIME', label: 'Full-time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'PART_TIME', label: 'Part-time' },
              ]}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.employment?.message}
            />
          )}
        />
        <Textarea
          label="Description"
          {...register('description')}
          valueLength={description.length}
          maxLength={2000}
          showCount
          error={errors.description?.message}
        />
        <Checkbox label="I currently work here" {...register('current')} />
      </FormSection>
    </FormLayout>
  );
}

export const ExperienceFormPattern: StoryObj = {
  render: () => <ExperienceFormDemo onValid={fn()} />,
};
