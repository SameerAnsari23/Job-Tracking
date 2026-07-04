import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Chip } from './Chip';
import { Icon } from './Icon';

const meta = {
  title: 'Foundation/Chip',
  component: Chip,
  args: { label: 'Remote' },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip label="Static (span)" />
      <Chip label="Toggle" onToggle={fn()} />
      <Chip label="Selected" selected onToggle={fn()} />
      <Chip label="Removable" selected onToggle={fn()} onRemove={fn()} />
      <Chip label="Disabled" disabled onToggle={fn()} />
      <Chip label="With icon" icon={<Icon name="mapPin" size={14} />} />
      <Chip label="Medium" size="md" onToggle={fn()} />
    </Box>
  ),
};

function ToggleDemo() {
  const [selected, setSelected] = useState(false);
  return <Chip label="Full-time" selected={selected} onToggle={() => setSelected(!selected)} />;
}

export const ToggleInteraction: Story = {
  render: () => <ToggleDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: /Full-time/ });
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    // Keyboard: Space toggles back
    chip.focus();
    await userEvent.keyboard(' ');
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
  },
};

export const RemoveInteraction: Story = {
  args: { label: '$120k+', onToggle: fn(), onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove $120k+' }));
    await expect(args.onRemove).toHaveBeenCalledOnce();
    await expect(args.onToggle).not.toHaveBeenCalled(); // stopPropagation
    // Delete key on the chip itself also removes
    canvas.getByRole('button', { name: /\$120k\+/ }).focus();
    await userEvent.keyboard('{Delete}');
    await expect(args.onRemove).toHaveBeenCalledTimes(2);
  },
};
