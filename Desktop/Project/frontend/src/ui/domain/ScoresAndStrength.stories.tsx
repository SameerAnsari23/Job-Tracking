import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { MatchScore } from './MatchScore';
import { ProfileStrength } from './ProfileStrength';
import { Button } from '../foundation/Button';

const meta: Meta = { title: 'Domain/MatchScore · ProfileStrength' };
export default meta;

export const MatchScoreThresholds: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <MatchScore score={92} tooltip="Matches your Backend Engineer profile" />
      <MatchScore score={65} />
      <MatchScore score={30} />
      <MatchScore score={0} />
      <MatchScore score={100} size={48} />
    </Box>
  ),
};

export const ProfileStrengthChecklist: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 360 }}>
      <ProfileStrength
        score={60}
        checklist={[
          { label: 'Basic profile', done: true },
          { label: 'Skills', done: true },
          { label: 'Experience', done: false },
          { label: 'Education', done: false },
          { label: 'Resume', done: false },
        ]}
        recommendationsSlot={
          <Button variant="ghost" size="sm">
            Add education
          </Button>
        }
      />
    </Box>
  ),
};

export const ProfileStrengthComplete: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 360 }}>
      <ProfileStrength score={100} />
    </Box>
  ),
};
