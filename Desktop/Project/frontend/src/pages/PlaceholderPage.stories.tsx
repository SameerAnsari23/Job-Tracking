import type { Meta, StoryObj } from '@storybook/react';
import { PlaceholderPage } from './PlaceholderPage';

/**
 * Bootstrap story — verifies the Storybook pipeline (Vite builder, theme
 * decorator, a11y addon) end to end. The real story catalog begins with
 * the Foundation components (blueprint Phase C).
 */
const meta = {
  title: 'Bootstrap/PlaceholderPage',
  component: PlaceholderPage,
} satisfies Meta<typeof PlaceholderPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Placeholder',
    phase: 'Phase 17.0',
  },
};
