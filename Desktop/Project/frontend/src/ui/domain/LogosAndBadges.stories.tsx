import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { CompanyLogo } from './CompanyLogo';
import { WorkplaceBadge } from './WorkplaceBadge';
import { EmploymentTypeBadge } from './EmploymentTypeBadge';
import { ProviderBadge } from './ProviderBadge';

const meta: Meta = { title: 'Domain/Logos & Badges' };
export default meta;

export const CompanyLogos: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
      <CompanyLogo name="Stripe" size={24} />
      <CompanyLogo name="Notion" size={32} />
      <CompanyLogo name="Vercel" size={48} />
      <CompanyLogo name="Broken Image Co" src="https://invalid.local/x.png" size={32} />
      <CompanyLogo name="" size={32} />
    </Box>
  ),
};

export const WorkplaceBadges: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <WorkplaceBadge type="REMOTE" />
      <WorkplaceBadge type="HYBRID" />
      <WorkplaceBadge type="ONSITE" />
    </Box>
  ),
};

export const EmploymentTypeBadges: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <EmploymentTypeBadge type="FULL_TIME" />
      <EmploymentTypeBadge type="PART_TIME" />
      <EmploymentTypeBadge type="INTERNSHIP" />
      <EmploymentTypeBadge type="CONTRACT" />
      <EmploymentTypeBadge type="FREELANCE" />
      <EmploymentTypeBadge type="TEMPORARY" />
      <EmploymentTypeBadge type="VOLUNTEER" />
      <EmploymentTypeBadge type="UNKNOWN" label="Fractional" />
    </Box>
  ),
};

export const EmploymentTypeUnknownRendersNothing: StoryObj = {
  render: () => (
    <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 4 }}>
      <EmploymentTypeBadge type="UNKNOWN" />
    </Box>
  ),
};

export const ProviderBadges: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <ProviderBadge provider="greenhouse" />
      <ProviderBadge provider="lever" />
      <ProviderBadge provider="ashby" />
      <ProviderBadge provider="smartrecruiters" />
      <ProviderBadge provider="workday" />
      <ProviderBadge provider="custom-ats" />
    </Box>
  ),
};
