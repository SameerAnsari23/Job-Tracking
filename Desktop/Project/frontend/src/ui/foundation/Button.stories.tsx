import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import Box from '@mui/material/Box';
import { Button } from './Button';
import { Icon } from './Icon';

const meta = {
  title: 'Foundation/Button',
  component: Button,
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { variant: 'primary', size: 'md', children: 'Save job' },
};

const VARIANTS = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const SIZES = ['sm', 'md', 'lg'] as const;

export const VariantMatrix: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {VARIANTS.map((variant) => (
        <Box key={variant} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {SIZES.map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
        </Box>
      ))}
    </Box>
  ),
};

export const States: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button>Rest</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Save job</Button>
      <Button iconStart={<Icon name="bookmark" size={16} />}>Icon start</Button>
      <Button iconEnd={<Icon name="externalLink" size={16} />}>Apply</Button>
      <Button iconOnly aria-label="Settings" variant="ghost">
        <Icon name="settings" size={18} />
      </Button>
      <Button fullWidth>Full width</Button>
    </Box>
  ),
};

/** Loading must lock width and block clicks (Phase 16.4 contract). */
export const LoadingLocksInteraction: Story = {
  args: { loading: true, children: 'Submitting' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button).catch(() => {});
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickFires: Story = {
  args: { children: 'Activate discovery' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Activate discovery' }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
