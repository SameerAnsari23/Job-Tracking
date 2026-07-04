import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { Surface } from './Surface';
import { Divider } from './Divider';
import { Link } from './Link';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import { Icon } from './Icon';
import { Typography } from './Typography';

/** Grouped structural atoms: Surface, Divider, Link, Tooltip. */
const meta: Meta = { title: 'Foundation/Surface · Divider · Link · Tooltip' };
export default meta;

export const Surfaces: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {(['flat', 'raised', 'inset'] as const).map((level) => (
        <Surface key={level} level={level} padding={6}>
          <Typography variant="h6">{level}</Typography>
          <Typography variant="textSm" color="secondary">
            24px padding · radius-lg
          </Typography>
        </Surface>
      ))}
      <Surface level="raised" interactive padding={6}>
        <Typography variant="h6">interactive</Typography>
        <Typography variant="textSm" color="secondary">
          hover lifts −1px
        </Typography>
      </Surface>
    </Box>
  ),
};

export const Dividers: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Typography variant="textSm">Above the rule</Typography>
      <Divider />
      <Divider label="or" />
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', height: 24 }}>
        <Typography variant="textSm">Left</Typography>
        <Divider orientation="vertical" />
        <Typography variant="textSm">Right</Typography>
      </Box>
    </Box>
  ),
};

export const Links: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant="textBase">
        Inline <Link href="#">accent link</Link> inside body text.
      </Typography>
      <Typography variant="textSm" color="secondary">
        Subtle{' '}
        <Link href="#" variant="subtle">
          inherits color
        </Link>{' '}
        until hover.
      </Typography>
      <Link href="https://stripe.com/jobs" external>
        Apply at Stripe
      </Link>
    </Box>
  ),
};

export const Tooltips: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, p: 10 }}>
      <Tooltip content="Save this job" delay={0}>
        <Button iconOnly aria-label="Save this job" variant="ghost">
          <Icon name="bookmark" size={18} />
        </Button>
      </Tooltip>
      <Tooltip content="Bottom placement" placement="bottom" delay={0}>
        <Button variant="secondary">Hover or focus me</Button>
      </Tooltip>
    </Box>
  ),
};
