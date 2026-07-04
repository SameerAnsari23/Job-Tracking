import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { Spinner } from './Spinner';
import { Skeleton } from './Skeleton';
import { Progress } from './Progress';
import { Typography } from './Typography';
import { Surface } from './Surface';

/** Grouped feedback atoms: Spinner, Skeleton, Progress. */
const meta: Meta = { title: 'Foundation/Spinner · Skeleton · Progress' };
export default meta;

export const Spinners: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {([14, 16, 20, 32] as const).map((size) => (
        <Box key={size} sx={{ textAlign: 'center' }}>
          <Spinner size={size} delayMs={0} label={`Loading (${size}px)`} />
          <Typography variant="textXs" color="secondary">
            {size}px
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};

export const Skeletons: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420 }}>
      <Skeleton shape="text" width="70%" />
      <Skeleton shape="text" lines={3} />
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Skeleton shape="circle" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton shape="text" width="50%" />
          <Skeleton shape="text" width="30%" />
        </Box>
      </Box>
      <Skeleton shape="rect" width="100%" height={88} />
      <Typography variant="textXs" color="secondary">
        rect matches the 88px JobCard geometry — zero layout shift on load
      </Typography>
    </Box>
  ),
};

export const ProgressBars: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 360 }}>
      <Progress value={25} aria-label="Profile completion 25%" />
      <Progress value={75} aria-label="Profile completion 75%" animateOnMount />
      <Progress value={100} tone="success" aria-label="Profile complete" />
      <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Progress variant="ring" value={40} aria-label="40 percent" />
        <Progress variant="ring" value={90} tone="success" size={48} aria-label="90 percent" />
      </Box>
    </Box>
  ),
};

export const SkeletonInsideSurface: StoryObj = {
  render: () => (
    <Surface level="raised" padding={6}>
      <Box aria-busy sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: 320 }}>
        <Skeleton shape="text" width="40%" />
        <Skeleton shape="text" lines={2} />
      </Box>
    </Surface>
  ),
};
